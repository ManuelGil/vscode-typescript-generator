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
 * Encapsulates workspace configuration values consumed by generation flows.
 *
 * @remarks
 * This class centralizes defaults and runtime updates so command and service
 * layers read a single normalized configuration model.
 *
 * @category Config
 */
export class ExtensionConfig {
  enable: boolean;
  workspaceSelection: string | undefined;
  defaultLanguage: 'TypeScript' | 'JavaScript';
  fileExtension: 'ts' | 'tsx' | 'js' | 'jsx';
  skipFolderConfirmation: boolean;
  includeTypeInFileName: boolean;
  skipTypeSelection: boolean;
  autoImport: boolean;
  defaultBarrelFileName: string;
  useSingleQuotes: boolean;
  excludeSemiColonAtEndOfLine: boolean;
  keepExtensionOnExport: boolean;
  endOfLine: 'crlf' | 'lf';
  useStrict: boolean;
  headerCommentTemplate: string[];
  insertFinalNewline: boolean;
  author: string;
  owner: string;
  maintainers: string;
  license: string;
  version: string;
  customComponents: ContentTemplate[];

  /**
   * Builds a configuration snapshot from workspace settings.
   *
   * @param config - Workspace configuration source.
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

  /**
   * Refreshes the in-memory configuration snapshot from workspace settings.
   *
   * @param config - Updated workspace configuration source.
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
