import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateClassCommad class.
 *
 * @class
 * @classdesc The class that represents the generate class command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateClassCommad(config);
 */
export class GenerateClassCommad extends BaseCommand {
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
    this.service.generateClass(folderPath);
  }
}