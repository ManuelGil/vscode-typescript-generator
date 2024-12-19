import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateFunctionCommad class.
 *
 * @class
 * @classdesc The class that represents the generate function command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateFunctionCommad(config);
 */
export class GenerateFunctionCommad extends BaseCommand {
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
    this.service.generateFunction(folderPath);
  }
}
