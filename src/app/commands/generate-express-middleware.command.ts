import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateExpressMiddlewareCommand class.
 *
 * @class
 * @classdesc The class that represents the generate express middleware command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateExpressMiddlewareCommand(config);
 */
export class GenerateExpressMiddlewareCommand extends BaseCommand {
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
   * @memberof GenerateExpressMiddlewareCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'express-middleware');
  }
}
