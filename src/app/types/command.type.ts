import { Uri } from 'vscode';

/**
 * The Command interface.
 *
 * @interface
 * @export
 * @public
 * @property {Promise<void>} execute - The execute method
 * @property {Uri} folderPath - The folder path
 * @example
 * class Command implements Command {
 *   async execute(folderPath?: Uri): Promise<void> {
 *     console.log('Hello, World!');
 *   }
 * }
 */
export interface Command {
  execute(folderPath?: Uri): Promise<void>;
}
