import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateVariableCommand class.
 *
 * @class
 * @classdesc The class that represents the generate variable command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateVariableCommand(config);
 */
export class GenerateVariableCommand extends BaseCommand {
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
    this.service.generateComponent(folderPath, 'variable');
  }
}
