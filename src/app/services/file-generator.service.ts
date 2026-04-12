import mustache from 'mustache';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
} from 'path';
import {
  commands,
  l10n,
  Position,
  Uri,
  WorkspaceEdit,
  WorkspaceFolder,
  window,
  workspace,
} from 'vscode';

import { ContentTemplate, ExtensionConfig } from '../configs';
import {
  camelize,
  constantize,
  generateQuickPickOption,
  getCustomTemplateByName,
  kebabize,
  pascalize,
  pluralize,
  readFileContent,
  relativePath,
  resolveFolderResource,
  saveFile as saveWorkspaceFile,
  sentenceCase,
  singularize,
  snakeize,
  titleize,
  toPosixPath,
} from '../helpers';

/**
 * Generates files from templates and user input.
 *
 * The service owns the orchestration around template resolution, name prompts,
 * path validation, content generation and file persistence.
 *
 * @class
 * @example
 * const service = new FileGeneratorService(config, extensionUri);
 */
export class FileGeneratorService {
  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * The constructor.
   *
   * @param {ExtensionConfig} config - The extension configuration.
   * @param {string} extensionUri - The extension URI.
   * @memberof FileGeneratorService
   */
  constructor(
    private readonly config: ExtensionConfig,
    private readonly extensionUri: Uri,
  ) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * Generates a typed component file in the selected workspace folder.
   *
   * @param folderPath Folder context supplied by VS Code.
   * @param componentType Template family to generate.
   */
  async generateComponent(
    folderPath?: Uri,
    componentType?: string,
  ): Promise<void> {
    if (!folderPath || !componentType) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    await this.createComponentFile(folderPath, componentType);
  }

  /**
   * Builds the file content and writes the generated component to disk.
   *
   * @param folderPath Folder context supplied by VS Code.
   * @param componentType Template family to generate.
   */
  private async createComponentFile(
    folderPath: Uri,
    componentType: string,
  ): Promise<void> {
    const {
      fileExtension,
      skipFolderConfirmation,
      includeTypeInFileName,
      skipTypeSelection,
      autoImport,
      defaultLanguage,
      defaultBarrelFileName,
    } = this.config;

    let workspaceFolder: WorkspaceFolder | undefined;
    let relativeFolderPath: string = '';

    if (folderPath) {
      const targetFolderUri = await resolveFolderResource(folderPath);

      if (targetFolderUri) {
        workspaceFolder = workspace.getWorkspaceFolder(targetFolderUri);
        relativeFolderPath = await relativePath(
          targetFolderUri,
          false,
          this.config,
        );
      }
    } else if (
      workspace.workspaceFolders &&
      workspace.workspaceFolders.length === 1
    ) {
      workspaceFolder = workspace.workspaceFolders[0];
    } else {
      const placeholder = l10n.t(
        'Select a workspace folder to use. This folder will be used to generate the file',
      );
      workspaceFolder = await window.showWorkspaceFolderPick({
        placeHolder: placeholder,
      });
    }

    if (!workspaceFolder) {
      const message = l10n.t(
        'The workspace folder does not exist. Please select a valid workspace folder to use',
      );
      window.showErrorMessage(message);
      return;
    }

    let folderName: string | undefined;

    if (!folderPath || !skipFolderConfirmation) {
      folderName = await this.promptInput(
        l10n.t(
          'Enter the folder name where the {0} will be created',
          componentType,
        ),
        l10n.t('Enter the folder name, e.g. models, services, utils, etc'),
        relativeFolderPath,
        (path) =>
          !/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)
            ? l10n.t(
                'The folder name is invalid! Please enter a valid folder name',
              )
            : undefined,
      );

      if (!folderName) {
        const message = l10n.t('Operation cancelled!');
        window.showInformationMessage(message);
        return;
      }
    } else {
      folderName = relativeFolderPath;
    }

    // Validate folder path to prevent absolute paths or path traversal
    if (folderName) {
      const normalizedFolder = normalize(folderName);
      if (
        isAbsolute(normalizedFolder) ||
        /(^|[\\/])\.\.(?:[\\/]|$)/.test(normalizedFolder)
      ) {
        const message = l10n.t(
          'The folder name is invalid. Please provide a relative path within the workspace and avoid ".."',
        );
        window.showErrorMessage(message);
        return;
      }
    }

    const componentFileName = await this.promptInput(
      l10n.t(
        'Enter the file name for the custom component. The file extension will be added automatically',
      ),
      l10n.t('Enter the file name, e.g. User, Product, Order, etc'),
    );

    if (!componentFileName) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const template = await this.getTemplate(componentType);

    if (!template) {
      const message = l10n.t(
        'The template for the {0} does not exist. Please try again',
        componentType,
      );
      window.showErrorMessage(message);
      return;
    }

    let selectedComponentType: string | undefined;

    if (!skipTypeSelection && includeTypeInFileName) {
      selectedComponentType = await this.promptInput(
        l10n.t('Enter the {0} type (optional)', componentType),
        l10n.t(
          'Enter the {0} type, e.g. model, service, util, etc',
          componentType,
        ),
        undefined,
        (name) =>
          !/(^[a-z]+$)|(^$)/.test(name)
            ? l10n.t(
                'The {0} type is invalid! Please enter a valid type',
                componentType,
              )
            : undefined,
      );
    }

    const content = this.generateFileContent(template.template);

    const fileContent = mustache.render(
      content,
      this.getVariables(
        folderName,
        componentFileName,
        selectedComponentType || template.type,
        fileExtension,
      ),
    );

    const componentFullName = selectedComponentType
      ? includeTypeInFileName
        ? `${pascalize(componentFileName)}${titleize(selectedComponentType)}`
        : `${pascalize(componentFileName)}${titleize(template.type)}`
      : pascalize(componentFileName);
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = includeTypeInFileName
      ? selectedComponentType
        ? `.${selectedComponentType}`
        : `.${template.type}`
      : '';
    const fileName = `${componentFileName}${fileNameSuffix}.${fileExtension}`;

    void saveWorkspaceFile(
      resolvedFolderPath,
      fileName,
      fileContent,
      this.config,
    );

    if (autoImport) {
      const barrelFileExtension =
        defaultLanguage === 'TypeScript' ? 'ts' : 'js';
      const barrelFileName = `${defaultBarrelFileName}.${barrelFileExtension}`;

      this.autoImport(
        resolvedFolderPath,
        fileName,
        componentFullName,
        barrelFileName,
        componentType === 'interface' || componentType === 'type',
      );
    }
  }

  /**
   * Generates a file from a user-selected custom template.
   *
   * @param folderPath Folder context supplied by VS Code.
   */
  async generateCustomComponent(folderPath?: Uri): Promise<void> {
    if (!folderPath) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    await this.createCustomComponentFile(folderPath);
  }

  /**
   * Resolves the selected custom template and writes the generated file.
   *
   * @param folderPath Folder context supplied by VS Code.
   */
  private async createCustomComponentFile(folderPath: Uri): Promise<void> {
    const {
      fileExtension,
      skipFolderConfirmation,
      includeTypeInFileName,
      autoImport,
      defaultLanguage,
      defaultBarrelFileName,
      customComponents,
    } = this.config;

    let workspaceFolder: WorkspaceFolder | undefined;
    let relativeFolderPath: string = '';

    if (folderPath) {
      const targetFolderUri = await resolveFolderResource(folderPath);

      if (targetFolderUri) {
        workspaceFolder = workspace.getWorkspaceFolder(targetFolderUri);
        relativeFolderPath = await relativePath(
          targetFolderUri,
          false,
          this.config,
        );
      }
    } else if (
      workspace.workspaceFolders &&
      workspace.workspaceFolders.length === 1
    ) {
      workspaceFolder = workspace.workspaceFolders[0];
    } else {
      const placeholder = l10n.t(
        'Select a workspace folder to use. This folder will be used to generate the file',
      );
      workspaceFolder = await window.showWorkspaceFolderPick({
        placeHolder: placeholder,
      });
    }

    if (!workspaceFolder) {
      const message = l10n.t(
        'The workspace folder does not exist. Please select a valid workspace folder to use',
      );
      window.showErrorMessage(message);
      return;
    }

    let folderName: string | undefined;

    if (!folderPath || !skipFolderConfirmation) {
      folderName = await this.promptInput(
        l10n.t(
          'Enter the folder name where the custom component will be created',
        ),
        l10n.t('Enter the folder name, e.g. components, shared, etc'),
        relativeFolderPath,
        (path) =>
          !/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)
            ? l10n.t(
                'The folder name is invalid! Please enter a valid folder name',
              )
            : undefined,
      );

      if (!folderName) {
        const message = l10n.t('Operation cancelled!');
        window.showInformationMessage(message);
        return;
      }
    } else {
      folderName = relativeFolderPath;
    }

    // Validate folder path to prevent absolute paths or path traversal
    if (folderName) {
      const normalizedFolder = normalize(folderName);
      if (
        isAbsolute(normalizedFolder) ||
        /(^|[\\/])\.\.(?:[\\/]|$)/.test(normalizedFolder)
      ) {
        const message = l10n.t(
          'The folder name is invalid. Please provide a relative path within the workspace and avoid ".."',
        );
        window.showErrorMessage(message);
        return;
      }
    }

    if (customComponents.length === 0) {
      const message = l10n.t(
        'The custom components list is empty. Please add custom components to the configuration',
      );
      window.showErrorMessage(message);
      return;
    }

    const templateOptions = customComponents.map(generateQuickPickOption);

    const selectedTemplateOption = await window.showQuickPick(templateOptions, {
      placeHolder: l10n.t(
        'Select the template for the custom element generation',
      ),
    });

    if (!selectedTemplateOption) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const componentFileName = await this.promptInput(
      l10n.t(
        'Enter the file name for the custom component. The file extension will be added automatically',
      ),
      l10n.t('Enter the file name, e.g. User, Product, Order, etc'),
    );

    if (!componentFileName) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const selectedTemplate = getCustomTemplateByName(
      customComponents,
      selectedTemplateOption.label,
    );

    if (!selectedTemplate) {
      const message = l10n.t(
        'The template for the custom component does not exist. Please try again',
      );
      window.showErrorMessage(message);
      return;
    }

    const content = this.generateFileContent(selectedTemplate.template);

    const fileContent = mustache.render(
      content,
      this.getVariables(
        folderName,
        componentFileName,
        selectedTemplate.type,
        fileExtension,
      ),
    );

    const componentFullName = includeTypeInFileName
      ? `${pascalize(componentFileName)}${titleize(selectedTemplate.type)}`
      : pascalize(componentFileName);
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = includeTypeInFileName
      ? `.${selectedTemplate.type}`
      : '';
    const fileName = `${componentFileName}${fileNameSuffix}.${fileExtension}`;

    void saveWorkspaceFile(
      resolvedFolderPath,
      fileName,
      fileContent,
      this.config,
    );

    if (autoImport) {
      const barrelFileExtension =
        defaultLanguage === 'TypeScript' ? 'ts' : 'js';
      const barrelFileName = `${defaultBarrelFileName}.${barrelFileExtension}`;

      this.autoImport(
        resolvedFolderPath,
        fileName,
        componentFullName,
        barrelFileName,
        false,
      );
    }
  }

  /**
   * Prompts the user for input with optional validation.
   *
   * @param prompt Prompt text shown to the user.
   * @param placeholder Input placeholder text.
   * @param defaultValue Initial value.
   * @param validateInput Validation callback.
   */
  private async promptInput(
    prompt: string,
    placeholder: string,
    defaultValue?: string,
    validateInput?: (input: string) => string | undefined,
  ): Promise<string | undefined> {
    return window.showInputBox({
      prompt,
      placeHolder: placeholder,
      value: defaultValue,
      validateInput,
    });
  }

  /**
   * Resolves the template definition for the requested component type.
   *
   * @param command Component type to resolve.
   */
  private async getTemplate(
    command: string,
  ): Promise<ContentTemplate | undefined> {
    const templatePath = Uri.joinPath(
      this.extensionUri,
      'templates',
      `${command}.json`,
    );

    try {
      const text = await readFileContent(templatePath);
      return JSON.parse(text);
    } catch {
      return;
    }
  }

  /**
   * Normalizes template content before rendering.
   *
   * @param templateLines Raw template lines.
   */
  private generateFileContent(templateLines: string[]): string {
    const {
      excludeSemiColonAtEndOfLine,
      useSingleQuotes,
      endOfLine,
      useStrict,
      headerCommentTemplate,
      insertFinalNewline,
    } = this.config;

    const quote = useSingleQuotes ? "'" : '"';
    const newline = endOfLine === 'crlf' ? '\r\n' : '\n';

    let content: string = '';

    if (headerCommentTemplate.length > 0) {
      content += headerCommentTemplate.join(newline) + newline + newline;
    }

    if (useStrict) {
      content += `${quote}use strict${quote};${newline}${newline}`;
    }

    content += templateLines.join(newline);

    // Add a final newline
    if (insertFinalNewline) {
      content += newline;
    }

    if (excludeSemiColonAtEndOfLine) {
      content = content.replace(/;$/, '');
    }

    return content;
  }

  /**
   * Builds the mustache variables used by template rendering.
   *
   * @param folderName Relative folder name for the generated file.
   * @param componentName Generated file base name.
   * @param fileType Template type.
   * @param fileExtension Selected file extension.
   */
  private getVariables(
    folderName: string,
    componentName: string,
    fileType: string,
    fileExtension: string,
  ): Record<string, string | number> {
    const { author, owner, maintainers, license, version } = this.config;

    return {
      fileName: componentName,
      fileNameCamelCase: camelize(componentName),
      fileNamePascalCase: pascalize(componentName),
      fileNameKebabCase: kebabize(componentName),
      fileNameSnakeCase: snakeize(componentName),
      fileNameConstantCase: constantize(componentName),
      fileNameDotCase: componentName.replace(/\s+/g, '.').toLowerCase(),
      fileNamePathCase: componentName.replace(/\s+/g, '/').toLowerCase(),
      fileNameSentenceCase: sentenceCase(componentName),
      fileNameLowerCase: componentName.toLowerCase(),
      fileNameTitleCase: titleize(componentName),
      fileNamePluralCase: pluralize(componentName),
      fileNameSingularCase: singularize(componentName),
      fileNameWithTypeAndExtension: `${componentName}.${fileType}.${fileExtension}`,
      fileNameWithType: `${componentName}.${fileType}`,
      fileNameWithExtension: `${componentName}.${fileExtension}`,
      folderName,
      fileType,
      fileTypeName: titleize(fileType),
      fileTypeNameCamelCase: camelize(fileType),
      fileTypeNamePascalCase: pascalize(fileType),
      fileTypeNameKebabCase: kebabize(fileType),
      fileTypeNameSnakeCase: snakeize(fileType),
      fileTypeNameConstantCase: constantize(fileType),
      fileTypeNameDotCase: fileType.replace(/\s+/g, '.').toLowerCase(),
      fileTypeNamePathCase: fileType.replace(/\s+/g, '/').toLowerCase(),
      fileTypeNameSentenceCase: sentenceCase(fileType),
      fileTypeNameLowerCase: fileType.toLowerCase(),
      fileTypeNameUpperCase: fileType.toUpperCase(),
      fileTypeNamePlural: pluralize(fileType),
      fileTypeNameSingular: singularize(fileType),
      fileTypeWithExtension: `${fileType}.${fileExtension}`,
      fileExtension,
      date: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().getTime(),
      timestampISO: new Date().toISOString(),
      timestampUTC: new Date().toUTCString(),
      timestampLocale: new Date().toLocaleString(),
      timestampDate: new Date().toDateString(),
      timestampTime: new Date().toTimeString(),
      timestampLocaleDate: new Date().toLocaleDateString(),
      author,
      owner,
      maintainers,
      license,
      version,
    };
  }

  /**
   * Updates the nearest barrel file with the generated export.
   *
   * @param targetDirectoryPath Directory that owns the generated file.
   * @param importedFileName Generated file name.
   * @param entityImportName Exported symbol name.
   * @param barrelFileName Barrel file name.
   * @param useTypeImport Whether the export should be type-only.
   */
  private async autoImport(
    targetDirectoryPath: string,
    importedFileName: string,
    entityImportName: string,
    barrelFileName: string,
    useTypeImport: boolean = false,
  ): Promise<void> {
    const {
      useSingleQuotes,
      excludeSemiColonAtEndOfLine,
      keepExtensionOnExport,
    } = this.config;

    const quote = useSingleQuotes ? "'" : '"';
    const semi = excludeSemiColonAtEndOfLine ? '' : ';';

    try {
      let barrelFileUri = Uri.file(join(targetDirectoryPath, barrelFileName));
      let barrelFileExists = false;

      // Check if barrel file exists in the current directory; if not, try parent directory
      try {
        await workspace.fs.stat(barrelFileUri);
        barrelFileExists = true;
      } catch (error: unknown) {
        const errorCode =
          error instanceof Error
            ? (error as Error & { code?: string }).code
            : undefined;

        if (errorCode !== 'FileNotFound') {
          throw error;
        }
        const resolvedDirectoryPath = join(targetDirectoryPath, '..');
        barrelFileUri = Uri.file(join(resolvedDirectoryPath, barrelFileName));
        try {
          await workspace.fs.stat(barrelFileUri);
          barrelFileExists = true;
        } catch (nestedError: unknown) {
          const nestedErrorCode =
            nestedError instanceof Error
              ? (nestedError as Error & { code?: string }).code
              : undefined;

          if (nestedErrorCode !== 'FileNotFound') {
            throw nestedError;
          }
        }
      }

      // If barrel file is not found in either location, show error and abort
      if (!barrelFileExists) {
        const message = l10n.t(
          'The barrel file {0} does not exist! Please create a barrel file first',
          barrelFileName,
        );
        window.showErrorMessage(message);
        return;
      }

      const document = await workspace.openTextDocument(barrelFileUri);

      if (!document) {
        const message = l10n.t(
          'The barrel file could not be opened! Please try again',
        );
        window.showErrorMessage(message);
        return;
      }

      let relativeImportPath = toPosixPath(
        relative(dirname(barrelFileUri.fsPath), targetDirectoryPath),
      );

      if (relativeImportPath !== '') {
        relativeImportPath = `${relativeImportPath}/`;
      }

      let fileName: string;

      if (!keepExtensionOnExport) {
        fileName = basename(importedFileName, extname(importedFileName));
      } else {
        fileName = basename(importedFileName);
      }

      const edit = new WorkspaceEdit();

      if (useTypeImport) {
        edit.insert(
          barrelFileUri,
          new Position(0, 0),
          `export type { ${entityImportName} } from ${quote}./${relativeImportPath}${fileName}${quote}${semi}\n`,
        );
      } else {
        edit.insert(
          barrelFileUri,
          new Position(0, 0),
          `export * from ${quote}./${relativeImportPath}${fileName}${quote}${semi}\n`,
        );
      }

      await workspace.applyEdit(edit);

      await window.showTextDocument(document);
      await commands.executeCommand('editor.action.formatDocument');
      await commands.executeCommand('editor.action.organizeImports');
      await commands.executeCommand('workbench.action.files.saveAll');

      const message = l10n.t(
        'Auto-import of {0} into {1} is successful!',
        entityImportName,
        workspace.asRelativePath(barrelFileUri),
      );
      window.showInformationMessage(message);
    } catch (error) {
      const message = l10n.t('Auto-import failed! Please try again');
      window.showErrorMessage(message);
    }
  }
}
