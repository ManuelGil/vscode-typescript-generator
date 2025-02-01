import {
  access,
  existsSync,
  mkdirSync,
  open,
  readFileSync,
  writeFile,
} from 'fs';
import * as mustache from 'mustache';
import { basename, dirname, extname, join, relative } from 'path';
import {
  Position,
  Uri,
  WorkspaceEdit,
  WorkspaceFolder,
  commands,
  l10n,
  window,
  workspace,
} from 'vscode';
import { ContentTemplate, ExtensionConfig } from '../configs';
import {
  camelize,
  constantize,
  kebabize,
  pascalize,
  pluralize,
  sentenceCase,
  singularize,
  snakeize,
  titleize,
} from '../helpers';

/**
 * The FileGeneratorService class.
 * This class is responsible for generating files.
 *
 * @class
 * @example
 * const service = new FileGeneratorService(config);
 * service.generateEntity('class', Uri.parse('path'), true);
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
   * The generateComponent method.
   *
   * @function generateComponent
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateComponent(Uri.parse('path'), 'component');
   *
   * @param {Uri} folderPath - The folder path
   * @param {string} componentType - The component type
   *
   * @returns {Promise<void>} - The promise with no return value
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
   * The generateCustomComponent method.
   *
   * @function generateCustomComponent
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateCustomComponent(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateCustomComponent(folderPath?: Uri): Promise<void> {
    if (!folderPath) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    await this.createCustomComponentFile(folderPath);
  }

  // Private methods

  /**
   * The createComponentFile method.
   *
   * @function createComponentFile
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.createComponentFile('class', Uri.parse('path'), true);
   *
   * @param {string} componentType - The entity type
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
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
      workspaceFolder = workspace.getWorkspaceFolder(folderPath);
      relativeFolderPath = workspace.asRelativePath(folderPath);
    } else if (
      workspace.workspaceFolders &&
      workspace.workspaceFolders.length === 1
    ) {
      workspaceFolder = workspace.workspaceFolders[0];
    } else {
      const placeHolder = l10n.t(
        'Select a workspace folder to use. This folder will be used to generate the file',
      );
      workspaceFolder = await window.showWorkspaceFolderPick({
        placeHolder,
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
        l10n.t('Enter the folder name, e.g. models, services, utils, etc.'),
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

    const componentFileName = await this.promptInput(
      l10n.t(
        'Enter the file name for the custom component. The file extension will be added automatically',
      ),
      l10n.t('Enter the file name, e.g. User, Product, Order, etc.'),
    );

    if (!componentFileName) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const template = this.getTemplate(componentType);

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
          'Enter the {0} type, e.g. model, service, util, etc.',
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

    this.saveFile(resolvedFolderPath, fileName, fileContent);

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
   * The createCustomComponentFile method.
   *
   * @function createCustomComponentFile
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.createCustomComponentFile(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
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
      workspaceFolder = workspace.getWorkspaceFolder(folderPath);
      relativeFolderPath = workspace.asRelativePath(folderPath);
    } else if (
      workspace.workspaceFolders &&
      workspace.workspaceFolders.length === 1
    ) {
      workspaceFolder = workspace.workspaceFolders[0];
    } else {
      const placeHolder = l10n.t(
        'Select a workspace folder to use. This folder will be used to generate the file',
      );
      workspaceFolder = await window.showWorkspaceFolderPick({
        placeHolder,
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
        l10n.t('Enter the folder name, e.g. components, shared, etc.'),
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

    if (customComponents.length === 0) {
      const message = l10n.t(
        'The custom components list is empty. Please add custom components to the configuration',
      );
      window.showErrorMessage(message);
      return;
    }

    const items = customComponents.map((item: any) => {
      return {
        label: item.name,
        description: item.description,
        detail: item.type,
      };
    });

    const option = await window.showQuickPick(items, {
      placeHolder: l10n.t(
        'Select the template for the custom element generation',
      ),
    });

    if (!option) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const componentFileName = await this.promptInput(
      l10n.t(
        'Enter the file name for the custom component. The file extension will be added automatically',
      ),
      l10n.t('Enter the file name, e.g. User, Product, Order, etc.'),
      undefined,
    );

    if (!componentFileName) {
      const message = l10n.t('Operation cancelled!');
      window.showInformationMessage(message);
      return;
    }

    const template = customComponents.find(
      (item: any) => item.name === option.label,
    );

    if (!template) {
      const message = l10n.t(
        'The template for the custom component does not exist. Please try again',
      );
      window.showErrorMessage(message);
      return;
    }

    const content = this.generateFileContent(template.template);

    const fileContent = mustache.render(
      content,
      this.getVariables(
        folderName,
        componentFileName,
        template.type,
        fileExtension,
      ),
    );

    const componentFullName = includeTypeInFileName
      ? `${pascalize(componentFileName)}${titleize(template.type)}`
      : pascalize(componentFileName);
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = includeTypeInFileName ? `.${template.type}` : '';
    const fileName = `${componentFileName}${fileNameSuffix}.${fileExtension}`;

    this.saveFile(resolvedFolderPath, fileName, fileContent);

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
   * The promptInput method.
   *
   * @function promptInput
   * @private
   * @async
   * @memberof FilesController
   * @example
   * controller.promptInput('prompt', 'placeHolder', 'value', (input) => 'error');
   *
   * @param {string} prompt - The prompt
   * @param {string} placeHolder - The place holder
   * @param {string} value - The value
   * @param {(input: string) => string | undefined} validateInput - The validate input
   *
   * @returns {Promise<string | undefined>} - The promise with the return value
   */
  private async promptInput(
    prompt: string,
    placeHolder: string,
    value?: string,
    validateInput?: (input: string) => string | undefined,
  ): Promise<string | undefined> {
    return await window.showInputBox({
      prompt,
      placeHolder,
      value,
      validateInput,
    });
  }

  /**
   * The getTemplate method.
   *
   * @function getTemplate
   * @private
   * @memberof FilesController
   * @example
   * controller.getTemplate('command');
   *
   * @param {string} command - The command
   *
   * @returns {ContentTemplate | undefined} - The template or null
   */
  private getTemplate(command: string): ContentTemplate | undefined {
    const templatePath = Uri.joinPath(
      this.extensionUri,
      'templates',
      `${command}.json`,
    );

    if (!existsSync(templatePath.fsPath)) {
      return;
    }

    return JSON.parse(readFileSync(templatePath.fsPath, 'utf-8'));
  }

  /**
   * The generateFileContent method.
   *
   * @function generateFileContent
   * @param {string} entityName - The entity name
   * @param {string[]} template - The template
   * @memberof FilesController
   * @private
   * @example
   * controller.generateFileContent(['template']);
   *
   * @returns {string} - The file content
   */
  private generateFileContent(template: string[]): string {
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

    content += template.join(newline);

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
   * The getVariables method.
   *
   * @function getVariables
   * @private
   * @memberof FilesController
   * @example
   * controller.getVariables('folder', 'component', 'type', 'ext');
   *
   * @returns {Record<string, any>} - The variables
   */
  private getVariables(
    folderName: string,
    componentName: string,
    fileType: string,
    fileExtension: string,
  ): Record<string, any> {
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
      fileNameWithTypeAndExtention: `${componentName}.${fileType}.${fileExtension}`,
      fileNameWithType: `${componentName}.${fileType}`,
      fileNameWithExtention: `${componentName}.${fileExtension}`,
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
      fileTypeWithExtention: `${fileType}.${fileExtension}`,
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
   * The saveFile method.
   *
   * @function saveFile
   * @private
   * @async
   * @memberof FilesController
   * @example
   * controller.saveFile('path', 'filename', 'data');
   *
   * @param {string} directoryPath - The path
   * @param {string} fileName - The filename
   * @param {string} fileContent - The data
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  private async saveFile(
    directoryPath: string,
    fileName: string,
    fileContent: string,
  ): Promise<void> {
    const file = join(directoryPath, fileName);

    if (!existsSync(dirname(file))) {
      mkdirSync(dirname(file), { recursive: true });
    }

    access(file, (err: any) => {
      if (err) {
        open(file, 'w+', (err: any, fd: any) => {
          if (err) {
            const message = l10n.t(
              'The file has not been created! Please try again',
            );
            window.showErrorMessage(message);
            return;
          }

          writeFile(fd, fileContent, 'utf8', (err: any) => {
            if (err) {
              const message = l10n.t(
                'The {0} has been created successfully',
                fileName,
              );
              window.showErrorMessage(message);
              return;
            }

            const openPath = Uri.file(file);

            workspace.openTextDocument(openPath).then(async (filename) => {
              await commands.executeCommand('workbench.action.files.saveAll');
              await window.showTextDocument(filename);
            });
          });
        });

        const message = l10n.t('File created successfully!');
        window.showInformationMessage(message);
      } else {
        const message = l10n.t(
          'The file name already exists! Please enter a different name',
        );
        window.showWarningMessage(message);
      }
    });
  }

  /**
   * Auto import functionality for files.
   *
   * @function autoImport
   * @memberof FileController
   * @private
   * @async
   * @example
   * controller.autoImport('path', 'fileEntityName', 'entityImportName', 'dependencyFileName', true);
   *
   * @param {string} targetDirectoryPath - The path to the folder
   * @param {string} importedFileName - The name of the file entity
   * @param {string} entityImportName - The name of the entity to import
   * @param {string} barrelFileName - The name of the dependency file
   * @param {boolean} useTypeImport - The flag to use type import
   *
   * @returns {Promise<void>} The result of the operation
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

      if (!existsSync(barrelFileUri.fsPath)) {
        const resolvedDirectoryPath = join(targetDirectoryPath, '..');

        barrelFileUri = Uri.file(join(resolvedDirectoryPath, barrelFileName));

        if (!existsSync(barrelFileUri.fsPath)) {
          const message = l10n.t(
            'The barrel file does not exist! Please create a barrel file first',
          );
          window.showErrorMessage(message);
          return;
        }
      }

      const document = await workspace.openTextDocument(barrelFileUri);

      if (!document) {
        const message = l10n.t(
          'The barrel file could not be opened! Please try again',
        );
        window.showErrorMessage(message);
        return;
      }

      let relativePath = relative(
        dirname(barrelFileUri.fsPath),
        targetDirectoryPath,
      ).replace(/\\/g, '/');

      if (relativePath !== '') {
        relativePath = relativePath + '/';
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
          `export type { ${entityImportName} } from ${quote}./${relativePath}${fileName}${quote}${semi}\n`,
        );
      } else {
        edit.insert(
          barrelFileUri,
          new Position(0, 0),
          `export * from ${quote}./${relativePath}${fileName}${quote}${semi}\n`,
        );
      }

      await workspace.applyEdit(edit);

      await window.showTextDocument(document);
      await commands.executeCommand('editor.action.formatDocument');
      await commands.executeCommand('editor.action.organizeImports');
      await commands.executeCommand('workbench.action.files.saveAll');

      const message = l10n.t(
        'Auto-imported of {0} into {1} is successfully!',
        entityImportName,
        workspace.asRelativePath(barrelFileUri),
      );
      window.showInformationMessage(message);
    } catch (error) {
      const message = l10n.t('Auto-imported failed! Please try again');
      window.showErrorMessage(message);
    }
  }
}
