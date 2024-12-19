import { access, existsSync, mkdirSync, open, writeFile } from 'fs';
import { basename, dirname, extname, join } from 'path';
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
import { ExtensionConfig } from '../configs';

/**
 * The FileEntityType type.
 *
 * @type {FileEntityType}
 * @public
 * @memberof FileGeneratorService
 * @example
 * const entityType: FileEntityType = 'class';
 *
 * @property {'class' | 'interface' | 'enum' | 'type' | 'function' | 'variable'} FileEntityType - The file entity type
 *
 * @default 'class'
 */
type FileEntityType =
  | 'class'
  | 'interface'
  | 'enum'
  | 'type'
  | 'function'
  | 'variable';

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
   * @memberof FileGeneratorService
   */
  constructor(private readonly config: ExtensionConfig) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The generateEntity method.
   *
   * @function generateEntity
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateEntity('class', Uri.parse('path'), true);
   *
   * @param {FileEntityType} entityType - The entity type
   * @param {Uri} folderPath - The folder path
   * @param {boolean} allowEntityTypeInput - The flag to allow entity type input
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateEntity(
    entityType: FileEntityType,
    folderPath?: Uri,
    allowEntityTypeInput = false,
  ): Promise<void> {
    const { fileExtension, autoImport, defaultBarrelFileName } = this.config;
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

    const folderName = await this.promptInput(
      l10n.t('Enter the folder name where the {0} will be created', entityType),
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
      return;
    }

    const entityName = await this.promptInput(
      l10n.t('Enter the {0} name', entityType),
      l10n.t('Enter the {0} name, e.g. user, product, order, etc.', entityType),
      undefined,
      (name) =>
        !/^[a-zA-Z]+?$/.test(name)
          ? l10n.t(
              'The {0} name is invalid! Please enter a valid name',
              entityType,
            )
          : undefined,
    );

    if (!entityName) {
      return;
    }

    const entityTypeName = allowEntityTypeInput
      ? await this.promptInput(
          l10n.t('Enter the {0} type (optional)', entityType),
          l10n.t(
            'Enter the {0} type, e.g. model, service, util, etc.',
            entityType,
          ),
          undefined,
          (name) =>
            !/(^[a-z]+$)|(^$)/.test(name)
              ? l10n.t(
                  'The {0} type is invalid! Please enter a valid type',
                  entityType,
                )
              : undefined,
        )
      : undefined;

    const fullEntityName = entityTypeName
      ? `${entityName}${this.toTitleCase(entityTypeName)}`
      : `${entityName}${this.toTitleCase(entityType)}`;
    const resolvedFolderPath = join(workspaceFolder.uri.fsPath, folderName);
    const fileNameSuffix = entityTypeName || entityType;
    const fileName = `${this.toDashedString(entityName)}.${fileNameSuffix}.${fileExtension}`;
    const content = this.fileContent(fullEntityName, entityType);

    this.saveFile(resolvedFolderPath, fileName, content);

    if (autoImport) {
      this.autoImport(
        resolvedFolderPath,
        fileName,
        fullEntityName,
        defaultBarrelFileName,
        entityType === 'interface' || entityType === 'type',
      );
    }
  }

  /**
   * The generateClass method.
   *
   * @function generateClass
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateClass(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateClass(folderPath?: Uri): Promise<void> {
    await this.generateEntity('class', folderPath, true);
  }

  /**
   * The generateInterface method.
   *
   * @function generateInterface
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateInterface(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateInterface(folderPath?: Uri): Promise<void> {
    await this.generateEntity('interface', folderPath, true);
  }

  /**
   * The generateEnum method.
   *
   * @function generateEnum
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateEnum(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateEnum(folderPath?: Uri): Promise<void> {
    await this.generateEntity('enum', folderPath);
  }

  /**
   * The generateType method.
   *
   * @function generateType
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateType(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateType(folderPath?: Uri): Promise<void> {
    await this.generateEntity('type', folderPath);
  }

  /**
   * The generateFunction method.
   *
   * @function generateFunction
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateFunction(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateFunction(folderPath?: Uri): Promise<void> {
    await this.generateEntity('function', folderPath);
  }

  /**
   * The generateVariable method.
   *
   * @function generateVariable
   * @public
   * @async
   * @memberof FilesController
   * @example
   * controller.generateVariable(Uri.parse('path'));
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async generateVariable(folderPath?: Uri): Promise<void> {
    await this.generateEntity('variable', folderPath);
  }

  // Private methods

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
   * The toTitleCase method.
   * Converts the first character of a string to uppercase.
   *
   * @function toTitleCase
   * @private
   * @memberof FilesController
   * @example
   * controller.toTitleCase('input');
   *
   * @param {string} input - The input string
   *
   * @returns {string} - The title case string
   */
  private toTitleCase(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  /**
   * The toDashedString method.
   * Converts a camelCase string to a dashed string.
   *
   * @function toDashedString
   * @private
   * @memberof FilesController
   * @example
   * controller.toDashedString('input');
   *
   * @param {string} input - The input string
   *
   * @returns {string} - The dashed string
   */
  private toDashedString(input: string) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * The fileContent method.
   *
   * @function fileContent
   * @param {string} entityName - The entity name
   * @param {FileEntityType} type - The file entity type
   * @memberof FilesController
   * @private
   * @example
   * controller.fileContent('entityName', 'class');
   *
   * @returns {string} - The file content
   */
  private fileContent(entityName: string, type: FileEntityType): string {
    const {
      useSingleQuotes,
      excludeSemiColonAtEndOfLine,
      endOfLine,
      useStrict,
      headerCommentTemplate,
      insertFinalNewline,
    } = this.config;

    const quote = useSingleQuotes ? "'" : '"';
    const semi = excludeSemiColonAtEndOfLine ? '' : ';';
    const newline = endOfLine === 'crlf' ? '\r\n' : '\n';

    let content: string = '';

    if (headerCommentTemplate.length > 0) {
      content += headerCommentTemplate.join(newline) + newline + newline;
    }

    if (useStrict) {
      content += `${quote}use strict${quote};${newline}${newline}`;
    }

    switch (type) {
      case 'class':
        content += `export class ${entityName} {${newline}${newline}}${semi}`;
        break;

      case 'interface':
        content += `export interface ${entityName} {${newline}${newline}}${semi}`;
        break;

      case 'enum':
        content += `export enum ${entityName} {${newline}${newline}}${semi}`;
        break;

      case 'type':
        content += `export type ${entityName} = {}${semi}`;
        break;

      case 'function':
        content += `export function ${entityName}() {}${semi}`;
        break;

      case 'variable':
        content += `export const ${entityName} = {}${semi}`;
        break;

      default:
        break;
    }

    // Add a final newline
    if (insertFinalNewline) {
      content += newline;
    }

    return content;
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
            const message = l10n.t('The file has not been created! Please try again');
            window.showErrorMessage(message);
            return;
          }

          writeFile(fd, fileContent, 'utf8', (err: any) => {
            if (err) {
              const message = l10n.t('The {0} has been created successfully', fileName);
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
      const barrelFileUri = Uri.file(join(targetDirectoryPath, barrelFileName));

      if (!existsSync(barrelFileUri.fsPath)) {
        const message = l10n.t(
          'The barrel file does not exist! Please create a barrel file first',
        );
        window.showErrorMessage(message);
        return;
      }

      const document = await workspace.openTextDocument(barrelFileUri);

      if (!document) {
        const message = l10n.t('The barrel file could not be opened! Please try again');
        window.showErrorMessage(message);
        return;
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
          `export type { ${entityImportName} } from ${quote}./${fileName}${quote}${semi}\n`,
        );
      } else {
        edit.insert(
          barrelFileUri,
          new Position(0, 0),
          `export * from ${quote}./${fileName}${quote}${semi}\n`,
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
