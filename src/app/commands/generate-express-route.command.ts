import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateExpressRouteCommand class.
 *
 * @class
 * @classdesc The class that represents the generate express route command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateExpressRouteCommand(config);
 */
export class GenerateExpressRouteCommand extends BaseCommand {
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
   * @memberof GenerateExpressRouteCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'express-route');
  }
}
