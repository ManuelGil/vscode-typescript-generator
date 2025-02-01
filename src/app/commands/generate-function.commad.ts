import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateFunctionCommand class.
 *
 * @class
 * @classdesc The class that represents the generate function command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateFunctionCommand(config);
 */
export class GenerateFunctionCommand extends BaseCommand {
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
   * @memberof GenerateClassCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'function');
  }
}
