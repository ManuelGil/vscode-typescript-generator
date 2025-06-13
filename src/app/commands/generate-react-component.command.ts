import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateReactComponentCommand class.
 *
 * @class
 * @classdesc The class that represents the generate React component command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateReactComponentCommand(config);
 */
export class GenerateReactComponentCommand extends BaseCommand {
  /**
   * The execute method.
   *
   * @async
   * @method execute
   * @public
   * @memberof GenerateReactComponentCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    await this.service.generateComponent(folderPath, 'react-component');
  }
}
