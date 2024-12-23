import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateVariableCommad class.
 *
 * @class
 * @classdesc The class that represents the generate variable command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateVariableCommad(config);
 */
export class GenerateVariableCommad extends BaseCommand {
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
   * @memberof GenerateClassCommad
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateVariable(folderPath);
  }
}
