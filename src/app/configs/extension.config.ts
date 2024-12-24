import { WorkspaceConfiguration } from 'vscode';

import {
  DEFAULT_AUTO_IMPORT,
  DEFAULT_BARREL_FILE_NAME,
  DEFAULT_ENABLE,
  DEFAULT_END_OF_LINE,
  DEFAULT_EXCLUDE_SEMI_COLON_AT_END_OF_LINE,
  DEFAULT_FILE_EXTENSION,
  DEFAULT_HEADER_COMMENT_TEMPLATE,
  DEFAULT_INSERT_FINAL_NEWLINE,
  DEFAULT_KEEP_EXTENSION_ON_EXPORT,
  DEFAULT_SKIP_FOLDER_CONFIRMATION,
  DEFAULT_USE_SINGLE_QUOTES,
  DEFAULT_USE_STRICT,
} from './constants.config';

/**
 * The Config class.
 *
 * @class
 * @classdesc The class that represents the configuration of the extension.
 * @export
 * @public
 * @property {WorkspaceConfiguration} config - The workspace configuration
 * @property {boolean} enable - The enable the extension
 * @property {'ts' | 'tsx'} fileExtension - The file extension
 * @property {boolean} skipFolderConfirmation - The skip folder confirmation
 * @property {boolean} autoImport - The auto import
 * @property {string} defaultBarrelFileName - The default barrel file name
 * @property {boolean} useSingleQuotes - The use single quotes
 * @property {boolean} excludeSemiColonAtEndOfLine - The exclude semi-colon at the end of line
 * @property {boolean} keepExtensionOnExport - The keep extension on export
 * @property {'crlf' | 'lf'} endOfLine - The end of line
 * @property {boolean} useStrict - The use strict
 * @property {string[]} headerCommentTemplate - The header comment template
 * @property {boolean} insertFinalNewline - The insert final newline
 * @example
 * const config = new Config(workspace.getConfiguration());
 * console.log(config.enable);
 */
export class ExtensionConfig {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Public properties
  /**
   * The enable the extension.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.enable);
   * @default true
   */
  enable: boolean;

  /**
   * The file extension.
   * @type {'ts' | 'tsx'}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.fileExtension);
   * @default 'ts'
   */
  fileExtension: 'ts' | 'tsx';

  /**
   * The skip folder confirmation.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.skipFolderConfirmation);
   * @default false
   */
  skipFolderConfirmation: boolean;

  /**
   * The auto import.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.autoImport);
   * @default false
   */
  autoImport: boolean;

  /**
   * The default barrel file name.
   * @type {string}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.defaultBarrelFileName);
   * @default 'index.ts'
   */
  defaultBarrelFileName: string;

  /**
   * The use single quotes.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.useSingleQuotes);
   * @default true
   */
  useSingleQuotes: boolean;

  /**
   * The exclude semi-colon at the end of line.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.excludeSemiColonAtEndOfLine);
   * @default false
   */
  excludeSemiColonAtEndOfLine: boolean;

  /**
   * The keep extension on export.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.keepExtensionOnExport);
   * @default false
   */
  keepExtensionOnExport: boolean;

  /**
   * The end of line.
   * @type {'crlf' | 'lf'}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.endOfLine);
   * @default 'lf'
   */
  endOfLine: 'crlf' | 'lf';

  /**
   * The use strict.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.useStrict);
   * @default false
   */
  useStrict: boolean;

  /**
   * The header comment template.
   * @type {string[]}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.headerCommentTemplate);
   * @default []
   */
  headerCommentTemplate: string[];

  /**
   * The insert final newline.
   * @type {boolean}
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.insertFinalNewline);
   * @default true
   */
  insertFinalNewline: boolean;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the Config class.
   *
   * @constructor
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
   */
  constructor(readonly config: WorkspaceConfiguration) {
    this.enable = config.get<boolean>('enable', DEFAULT_ENABLE);
    this.fileExtension = config.get<'ts' | 'tsx'>(
      'files.fileExtension',
      DEFAULT_FILE_EXTENSION,
    );
    this.skipFolderConfirmation = config.get<boolean>(
      'files.skipFolderConfirmation',
      DEFAULT_SKIP_FOLDER_CONFIRMATION,
    );
    this.autoImport = config.get<boolean>(
      'files.autoImport',
      DEFAULT_AUTO_IMPORT,
    );
    this.defaultBarrelFileName = config.get<string>(
      'files.defaultBarrelFileName',
      DEFAULT_BARREL_FILE_NAME,
    );
    this.useSingleQuotes = config.get<boolean>(
      'formatting.useSingleQuotes',
      DEFAULT_USE_SINGLE_QUOTES,
    );
    this.excludeSemiColonAtEndOfLine = config.get<boolean>(
      'formatting.excludeSemiColonAtEndOfLine',
      DEFAULT_EXCLUDE_SEMI_COLON_AT_END_OF_LINE,
    );
    this.keepExtensionOnExport = config.get<boolean>(
      'formatting.keepExtensionOnExport',
      DEFAULT_KEEP_EXTENSION_ON_EXPORT,
    );
    this.endOfLine = config.get<'crlf' | 'lf'>(
      'formatting.endOfLine',
      DEFAULT_END_OF_LINE,
    );
    this.useStrict = config.get<boolean>(
      'formatting.useStrict',
      DEFAULT_USE_STRICT,
    );
    this.headerCommentTemplate = config.get<string[]>(
      'formatting.headerCommentTemplate',
      DEFAULT_HEADER_COMMENT_TEMPLATE,
    );
    this.insertFinalNewline = config.get<boolean>(
      'formatting.insertFinalNewline',
      DEFAULT_INSERT_FINAL_NEWLINE,
    );
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * The update method.
   *
   * @function update
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * config.update(workspace.getConfiguration());
   */
  update(config: WorkspaceConfiguration): void {
    this.enable = config.get<boolean>('enable', this.enable);
    this.fileExtension = config.get<'ts' | 'tsx'>(
      'files.fileExtension',
      this.fileExtension,
    );
    this.skipFolderConfirmation = config.get<boolean>(
      'files.skipFolderConfirmation',
      this.skipFolderConfirmation,
    );
    this.autoImport = config.get<boolean>('files.autoImport', this.autoImport);
    this.defaultBarrelFileName = config.get<string>(
      'files.defaultBarrelFileName',
      this.defaultBarrelFileName,
    );
    this.useSingleQuotes = config.get<boolean>(
      'formatting.useSingleQuotes',
      this.useSingleQuotes,
    );
    this.excludeSemiColonAtEndOfLine = config.get<boolean>(
      'formatting.excludeSemiColonAtEndOfLine',
      this.excludeSemiColonAtEndOfLine,
    );
    this.keepExtensionOnExport = config.get<boolean>(
      'formatting.keepExtensionOnExport',
      this.keepExtensionOnExport,
    );
    this.endOfLine = config.get<'crlf' | 'lf'>(
      'formatting.endOfLine',
      this.endOfLine,
    );
    this.useStrict = config.get<boolean>(
      'formatting.useStrict',
      this.useStrict,
    );
    this.headerCommentTemplate = config.get<string[]>(
      'formatting.headerCommentTemplate',
      this.headerCommentTemplate,
    );
    this.insertFinalNewline = config.get<boolean>(
      'formatting.insertFinalNewline',
      this.insertFinalNewline,
    );
  }
}
