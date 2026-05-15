import { Uri } from 'vscode';
import { ExtensionConfig } from '../configs';
import { FileGeneratorService } from '../services';
import type { Command, FolderContext } from '../types';

/**
 * Base abstraction for command implementations that delegate file generation.
 *
 * @remarks
 * Keeps command classes focused on selecting generation intent while sharing a
 * single `FileGeneratorService` wiring pattern.
 *
 * @category Commands
 * @internal
 */
export abstract class BaseCommand implements Command {
  protected service: FileGeneratorService;

  /**
   * Creates a base command with shared generation service access.
   *
   * @param config - Extension configuration snapshot.
   * @param extensionUri - Extension URI used to resolve built-in templates.
   * @param folderContext - Session-scoped folder memory for last generation target.
   */
  constructor(
    config: ExtensionConfig,
    extensionUri: Uri,
    folderContext: FolderContext,
  ) {
    this.service = new FileGeneratorService(
      config,
      extensionUri,
      folderContext,
    );
  }

  /**
   * Executes a command against an optional folder context.
   *
   * @param folderPath - Optional folder target selected in VS Code.
   * @example
   * await command.execute(folderUri);
   */
  abstract execute(folderPath?: Uri): Promise<void>;
}
