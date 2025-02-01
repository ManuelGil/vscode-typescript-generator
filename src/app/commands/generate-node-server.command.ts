import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateNodeServerCommand class.
 *
 * @class
 * @classdesc The class that represents the generate node server command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateNodeServerCommand(config);
 */
export class GenerateNodeServerCommand extends BaseCommand {
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
   * @memberof GenerateNodeServerCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'node-server');
  }
}
