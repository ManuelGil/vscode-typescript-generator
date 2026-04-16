import mustache from 'mustache';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  sep,
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
import { z } from 'zod';

import { ContentTemplate, ExtensionConfig } from '../configs';
import {
  camelize,
  constantize,
  generateQuickPickOption,
  getCustomTemplateByName,
  getErrorMessage,
  kebabize,
  pascalize,
  pluralize,
  readFileContent,
  relativePath,
  resolveFolderResource,
  saveFile,
  sentenceCase,
  singularize,
  snakeize,
  titleize,
  toPosixPath,
} from '../helpers';

const templateSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().optional(),
    type: z.string().trim().min(1),
    template: z.array(z.string()).min(1),
    tags: z.array(z.string()).optional(),
    context: z.unknown().optional(),
  })
  .passthrough();

/**
 * Orchestrates template-based file generation flows.
 *
 * @remarks
 * The service keeps no evolving internal state; behavior is driven by explicit
 * method inputs and current extension configuration.
 *
 * Side effects (file writes, prompts, editor actions) are intentional and
 * localized to generation workflows.
 *
 * This service does NOT:
 * - Detect project context
 * - Register or execute VS Code commands
 * - Decide Smart Generate ranking
 * @category Services
 * @internal
 */
export class FileGeneratorService {
  /**
   * Creates a file generator bound to extension configuration and URI.
   */
  constructor(
    private readonly config: ExtensionConfig,
    private readonly extensionUri: Uri,
  ) {}

  /**
   * Generates a typed component file in the selected workspace folder.
   *
   * @param folderPath Folder context supplied by VS Code.
   * @param componentType Template family to generate.
   * @example
   * await service.generateComponent(folderUri, 'class');
   */
  async generateComponent(
    folderPath?: Uri,
    componentType?: string,
  ): Promise<void> {
    if (!componentType) {
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
    folderPath: Uri | undefined,
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

    const sanitizedComponentFileName = this.sanitizeFileName(componentFileName);

    if (!sanitizedComponentFileName) {
      const message = l10n.t(
        'The file name is invalid! Please enter a valid file name',
      );
      window.showErrorMessage(message);
      return;
    }

    const template = await this.getTemplate(componentType);

    if (!template) {
      const message = l10n.t(
        'Template not found for command/template: {0}. Please verify the template file and try again',
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

    const templateContent = this.generateFileContent(template.template);

    const warnings = this.detectTemplateWarnings(templateContent);

    if (warnings.length > 0) {
      console.warn(l10n.t('Template warnings: {0}', warnings.join(', ')));
    }

    try {
      mustache.parse(templateContent);
    } catch (error) {
      this.showError(
        l10n.t('Invalid template syntax: {0}', getErrorMessage(error)),
      );
      return;
    }

    const fileContent = mustache.render(
      templateContent,
      this.getVariables(
        folderName,
        sanitizedComponentFileName,
        selectedComponentType || template.type,
        fileExtension,
      ),
    );

    const componentFullName = selectedComponentType
      ? includeTypeInFileName
        ? `${pascalize(sanitizedComponentFileName)}${titleize(selectedComponentType)}`
        : `${pascalize(sanitizedComponentFileName)}${titleize(template.type)}`
      : pascalize(sanitizedComponentFileName);
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = includeTypeInFileName
      ? selectedComponentType
        ? `.${selectedComponentType}`
        : `.${template.type}`
      : '';
    const fileName = `${sanitizedComponentFileName}${fileNameSuffix}.${fileExtension}`;

    try {
      const safePath = this.resolveSafePath(resolvedFolderPath, fileName);

      void saveFile(
        dirname(safePath),
        basename(safePath),
        fileContent,
        this.config,
      );

      if (autoImport) {
        const barrelFileExtension =
          defaultLanguage === 'TypeScript' ? 'ts' : 'js';
        const barrelFileName = `${defaultBarrelFileName}.${barrelFileExtension}`;

        this.autoImport(
          dirname(safePath),
          basename(safePath),
          componentFullName,
          barrelFileName,
          componentType === 'interface' || componentType === 'type',
        );
      }
    } catch (_error) {
      const message = l10n.t(
        'The file path is invalid. Please use a valid folder and file name.',
      );
      window.showErrorMessage(message);
    }
  }

  /**
   * Generates a file from a user-selected custom template.
   *
   * @param folderPath Folder context supplied by VS Code.
   * @example
   * await service.generateCustomComponent(folderUri);
   */
  async generateCustomComponent(folderPath?: Uri): Promise<void> {
    await this.createCustomComponentFile(folderPath);
  }

  /**
   * Resolves the selected custom template and writes the generated file.
   *
   * @param folderPath Folder context supplied by VS Code.
   */
  private async createCustomComponentFile(
    folderPath: Uri | undefined,
  ): Promise<void> {
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

    const sanitizedComponentFileName = this.sanitizeFileName(componentFileName);

    if (!sanitizedComponentFileName) {
      const message = l10n.t(
        'The file name is invalid! Please enter a valid file name',
      );
      window.showErrorMessage(message);
      return;
    }

    const selectedTemplate = getCustomTemplateByName(
      customComponents,
      selectedTemplateOption.label,
    );

    if (!selectedTemplate) {
      const message = l10n.t(
        'Template not found for command/template: {0}. Please verify customComponents configuration and try again',
        selectedTemplateOption.label,
      );
      window.showErrorMessage(message);
      return;
    }

    const templateContent = this.generateFileContent(selectedTemplate.template);

    const warnings = this.detectTemplateWarnings(templateContent);

    if (warnings.length > 0) {
      console.warn(l10n.t('Template warnings: {0}', warnings.join(', ')));
    }

    try {
      mustache.parse(templateContent);
    } catch (error) {
      this.showError(
        l10n.t('Invalid template syntax: {0}', getErrorMessage(error)),
      );
      return;
    }

    const fileContent = mustache.render(
      templateContent,
      this.getVariables(
        folderName,
        sanitizedComponentFileName,
        selectedTemplate.type,
        fileExtension,
      ),
    );

    const componentFullName = includeTypeInFileName
      ? `${pascalize(sanitizedComponentFileName)}${titleize(selectedTemplate.type)}`
      : pascalize(sanitizedComponentFileName);
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = includeTypeInFileName
      ? `.${selectedTemplate.type}`
      : '';
    const fileName = `${sanitizedComponentFileName}${fileNameSuffix}.${fileExtension}`;

    try {
      const safePath = this.resolveSafePath(resolvedFolderPath, fileName);

      void saveFile(
        dirname(safePath),
        basename(safePath),
        fileContent,
        this.config,
      );

      if (autoImport) {
        const barrelFileExtension =
          defaultLanguage === 'TypeScript' ? 'ts' : 'js';
        const barrelFileName = `${defaultBarrelFileName}.${barrelFileExtension}`;

        this.autoImport(
          dirname(safePath),
          basename(safePath),
          componentFullName,
          barrelFileName,
          false,
        );
      }
    } catch (_error) {
      const message = l10n.t(
        'The file path is invalid. Please use a valid folder and file name.',
      );
      window.showErrorMessage(message);
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
   * Removes unsafe characters from generated file names.
   *
   * @param name Raw file name.
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_.]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/_{2,}/g, '_')
      .trim();
  }

  /**
   * Resolves a file path and blocks traversal outside the base directory.
   *
   * @param basePath Folder where the file must be created.
   * @param fileName File name to resolve.
   */
  private resolveSafePath(basePath: string, fileName: string): string {
    const fileExtension = extname(fileName);
    const fileNameWithoutExtension = basename(fileName, fileExtension);
    const sanitizedFileName = this.sanitizeFileName(fileNameWithoutExtension);

    if (!sanitizedFileName) {
      throw new Error(l10n.t('Invalid file name'));
    }

    const fullPath = resolve(basePath, `${sanitizedFileName}${fileExtension}`);
    const normalizedBase = resolve(basePath);

    if (
      fullPath !== normalizedBase &&
      !fullPath.startsWith(`${normalizedBase}${sep}`)
    ) {
      throw new Error(
        l10n.t('Invalid path: Attempt to write outside workspace'),
      );
    }

    return fullPath;
  }

  /**
   * Detects lightweight template quality warnings without blocking generation.
   *
   * @remarks
   * These warnings are advisory only.
   *
   * IMPORTANT:
   * Keep this check fast and non-blocking.
   * It must never reject generation by itself.
   *
   * @param templateContent Renderable template content.
   */
  private detectTemplateWarnings(templateContent: string): string[] {
    const warnings: string[] = [];

    if (templateContent.includes('console.log')) {
      warnings.push(l10n.t('Template contains console.log'));
    }

    if (templateContent.includes(': any')) {
      warnings.push(l10n.t('Template uses "any" type'));
    }

    if (templateContent.includes('TODO')) {
      warnings.push(l10n.t('Template contains TODO comments'));
    }

    return warnings;
  }

  /**
   * Displays an error message using the existing user-facing flow.
   *
   * @param message Error message to display.
   */
  private showError(message: string): void {
    window.showErrorMessage(message);
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
      const rawTemplate: unknown = JSON.parse(text);
      const parsedTemplate = templateSchema.safeParse(rawTemplate);

      if (!parsedTemplate.success) {
        console.warn(
          `Template validation failed for "${command}": ${parsedTemplate.error.issues
            .map((issue) => issue.message)
            .join('; ')}`,
        );
        return;
      }

      const validatedTemplate = parsedTemplate.data;

      return {
        name: validatedTemplate.name,
        description:
          validatedTemplate.description ?? `Template for generating ${command}`,
        type: validatedTemplate.type,
        template: validatedTemplate.template,
      };
    } catch {
      console.warn(
        `Template "${command}" is invalid JSON and will be skipped.`,
      );
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
    } catch (_error) {
      const message = l10n.t(
        'Auto-import failed. Verify that the barrel file exists and try again.',
      );
      window.showErrorMessage(message);
    }
  }
}
