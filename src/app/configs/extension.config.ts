import { WorkspaceConfiguration } from 'vscode';

import {
  ContentTemplate,
  DEFAULT_AUTHOR,
  DEFAULT_AUTO_IMPORT,
  DEFAULT_BARREL_FILE_NAME,
  DEFAULT_CONTENT_TEMPLATES,
  DEFAULT_ENABLE,
  DEFAULT_END_OF_LINE,
  DEFAULT_EXCLUDE_SEMI_COLON_AT_END_OF_LINE,
  DEFAULT_FILE_EXTENSION,
  DEFAULT_HEADER_COMMENT_TEMPLATE,
  DEFAULT_INCLUDE_TYPE_IN_FILE_NAME,
  DEFAULT_INSERT_FINAL_NEWLINE,
  DEFAULT_KEEP_EXTENSION_ON_EXPORT,
  DEFAULT_LANGUAGE,
  DEFAULT_LICENSE,
  DEFAULT_MAINTAINERS,
  DEFAULT_OWNER,
  DEFAULT_SKIP_FOLDER_CONFIRMATION,
  DEFAULT_SKIP_TYPE_SELECTION,
  DEFAULT_USE_SINGLE_QUOTES,
  DEFAULT_USE_STRICT,
  DEFAULT_VERSION,
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
 * @property {'TypeScript' | 'JavaScript'} defaultLanguage - The default language
 * @property {'ts' | 'tsx' | 'js' | 'jsx'} fileExtension - The file extension
 * @property {boolean} skipFolderConfirmation - The skip folder confirmation
 * @property {boolean} includeTypeInFileName - The include type in file name
 * @property {boolean} skipTypeSelection - The skip type selection
 * @property {boolean} autoImport - The auto import
 * @property {string} defaultBarrelFileName - The default barrel file name
 * @property {boolean} useSingleQuotes - The use single quotes
 * @property {boolean} excludeSemiColonAtEndOfLine - The exclude semi-colon at the end of line
 * @property {boolean} keepExtensionOnExport - The keep extension on export
 * @property {'crlf' | 'lf'} endOfLine - The end of line
 * @property {boolean} useStrict - The use strict
 * @property {string[]} headerCommentTemplate - The header comment template
 * @property {boolean} insertFinalNewline - The insert final newline
 * @property {string} author - The author
 * @property {string} owner - The owner
 * @property {string} maintainers - The maintainers
 * @property {string} license - The license
 * @property {string} version - The version
 * @property {ContentTemplate[]} customComponents - The custom components
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
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.enable);
   * @default true
   */
  enable: boolean;

  /**
   * The default language.
   * @type {'TypeScript' | 'JavaScript'}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.defaultLanguage);
   * @default 'TypeScript'
   */
  defaultLanguage: 'TypeScript' | 'JavaScript';

  /**
   * The file extension.
   * @type {'ts' | 'tsx' | 'js' | 'jsx'}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.fileExtension);
   * @default 'ts'
   */
  fileExtension: 'ts' | 'tsx' | 'js' | 'jsx';

  /**
   * The skip folder confirmation.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.skipFolderConfirmation);
   * @default false
   */
  skipFolderConfirmation: boolean;

  /**
   * The include type in file name.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.includeTypeInFileName);
   * @default false
   */
  includeTypeInFileName: boolean;

  /**
   * The skip type selection.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.skipTypeSelection);
   * @default true
   */
  skipTypeSelection: boolean;

  /**
   * The auto import.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
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
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.insertFinalNewline);
   * @default true
   */
  insertFinalNewline: boolean;

  /**
   * The author.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.author);
   * @default ''
   */
  author: string;

  /**
   * The owner.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.owner);
   * @default ''
   */
  owner: string;

  /**
   * The maintainers.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.maintainers);
   * @default ''
   */
  maintainers: string;

  /**
   * The license.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.license);
   * @default ''
   */
  license: string;

  /**
   * The version.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.version);
   * @default ''
   */
  version: string;

  /**
   * The custom components.
   * @type {object[]}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new ExtensionConfig(workspace.getConfiguration());
   * console.log(config.customComponents);
   */
  customComponents: ContentTemplate[];

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the Config class.
   *
   * @constructor
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof ExtensionConfig
   */
  constructor(readonly config: WorkspaceConfiguration) {
    this.enable = config.get<boolean>('enable', DEFAULT_ENABLE);
    this.defaultLanguage = config.get<'TypeScript' | 'JavaScript'>(
      'files.defaultLanguage',
      DEFAULT_LANGUAGE,
    );
    this.fileExtension = config.get<'ts' | 'tsx' | 'js' | 'jsx'>(
      'files.fileExtension',
      DEFAULT_FILE_EXTENSION,
    );
    this.skipFolderConfirmation = config.get<boolean>(
      'files.skipFolderConfirmation',
      DEFAULT_SKIP_FOLDER_CONFIRMATION,
    );
    this.includeTypeInFileName = config.get<boolean>(
      'files.includeTypeInFileName',
      DEFAULT_INCLUDE_TYPE_IN_FILE_NAME,
    );
    this.skipTypeSelection = config.get<boolean>(
      'files.skipTypeSelection',
      DEFAULT_SKIP_TYPE_SELECTION,
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
    this.author = config.get<string>('project.author', DEFAULT_AUTHOR);
    this.owner = config.get<string>('project.owner', DEFAULT_OWNER);
    this.maintainers = config.get<string>(
      'project.maintainers',
      DEFAULT_MAINTAINERS,
    );
    this.license = config.get<string>('project.license', DEFAULT_LICENSE);
    this.version = config.get<string>('project.version', DEFAULT_VERSION);
    this.customComponents = config.get<ContentTemplate[]>(
      'templates.customComponents',
      DEFAULT_CONTENT_TEMPLATES,
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
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * config.update(workspace.getConfiguration());
   */
  update(config: WorkspaceConfiguration): void {
    this.enable = config.get<boolean>('enable', this.enable);
    this.defaultLanguage = config.get<'TypeScript' | 'JavaScript'>(
      'files.defaultLanguage',
      this.defaultLanguage,
    );
    this.fileExtension = config.get<'ts' | 'tsx' | 'js' | 'jsx'>(
      'files.fileExtension',
      this.fileExtension,
    );
    this.skipFolderConfirmation = config.get<boolean>(
      'files.skipFolderConfirmation',
      this.skipFolderConfirmation,
    );
    this.includeTypeInFileName = config.get<boolean>(
      'files.includeTypeInFileName',
      this.includeTypeInFileName,
    );
    this.skipTypeSelection = config.get<boolean>(
      'files.skipTypeSelection',
      this.skipTypeSelection,
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
    this.author = config.get<string>('project.author', this.author);
    this.owner = config.get<string>('project.owner', this.owner);
    this.maintainers = config.get<string>(
      'project.maintainers',
      this.maintainers,
    );
    this.license = config.get<string>('project.license', this.license);
    this.version = config.get<string>('project.version', this.version);
    this.customComponents = config.get<ContentTemplate[]>(
      'templates.customComponents',
      this.customComponents,
    );
  }
}
