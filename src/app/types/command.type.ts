import { Uri } from 'vscode';

/**
 * Contract implemented by executable extension commands.
 *
 * @remarks
 * Commands receive the folder context resolved by runtime orchestration.
 * Implementations should encapsulate generation behavior for one command id.
 *
 * @category Types
 */
export interface Command {
  execute(folderPath?: Uri): Promise<void>;
}
