import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateEnumCommand class.
 *
 * @class
 * @classdesc The class that represents the generate enum command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateEnumCommand(config);
 */
export class GenerateEnumCommand extends BaseCommand {
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
    this.service.generateComponent(folderPath, 'enum');
  }
}
