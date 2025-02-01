import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateClassCommand class.
 *
 * @class
 * @classdesc The class that represents the generate class command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateClassCommand(config);
 */
export class GenerateClassCommand extends BaseCommand {
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
    this.service.generateComponent(folderPath, 'class');
  }
}
