import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateTypeCommad class.
 *
 * @class
 * @classdesc The class that represents the generate type command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateTypeCommad(config);
 */
export class GenerateTypeCommad extends BaseCommand {
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
    this.service.generateType(folderPath);
  }
}
