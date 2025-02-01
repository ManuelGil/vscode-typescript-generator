import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateNodeModuleCommand class.
 *
 * @class
 * @classdesc The class that represents the generate node module command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateNodeModuleCommand(config);
 */
export class GenerateNodeModuleCommand extends BaseCommand {
  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The execute method.
   *
   * @async
   * @method execute
   * @public
   * @memberof GenerateNodeModuleCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'node-module');
  }
}
