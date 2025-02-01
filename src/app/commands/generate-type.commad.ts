import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateTypeCommand class.
 *
 * @class
 * @classdesc The class that represents the generate type command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateTypeCommand(config);
 */
export class GenerateTypeCommand extends BaseCommand {
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
    this.service.generateComponent(folderPath, 'type');
  }
}
