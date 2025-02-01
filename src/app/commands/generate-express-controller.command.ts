import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateExpressControllerCommand class.
 *
 * @class
 * @classdesc The class that represents the generate express controller command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateExpressControllerCommand(config);
 */
export class GenerateExpressControllerCommand extends BaseCommand {
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
   * @memberof GenerateExpressControllerCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'express-controller');
  }
}
