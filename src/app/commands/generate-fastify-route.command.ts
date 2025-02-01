import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateFastifyRouteCommand class.
 *
 * @class
 * @classdesc The class that represents the generate fastify route command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateFastifyRouteCommand(config);
 */
export class GenerateFastifyRouteCommand extends BaseCommand {
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
   * @memberof GenerateFastifyRouteCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'fastify-route');
  }
}
