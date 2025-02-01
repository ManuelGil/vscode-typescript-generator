import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateExpressServerCommand class.
 *
 * @class
 * @classdesc The class that represents the generate express server command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateExpressServerCommand(config);
 */
export class GenerateExpressServerCommand extends BaseCommand {
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
   * @memberof GenerateExpressServerCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'express-server');
  }
}
