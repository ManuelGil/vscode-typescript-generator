import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * Command entry point for generating a specific artifact template.
 *
 * @remarks
 * Delegates generation to FileGeneratorService through BaseCommand.
 *
 * @category Commands
 * @internal
 */
export class GenerateFunctionCommand extends BaseCommand {
  /**
   * Executes the command for the provided folder context.
   *
   * @param folderPath - Optional folder target selected in VS Code.
   * @example
   * await command.execute(folderUri);
   */
  async execute(folderPath?: Uri): Promise<void> {
    await this.service.generateComponent(folderPath, 'function');
  }
}
