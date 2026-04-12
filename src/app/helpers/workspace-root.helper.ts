/**
 * @fileoverview Resolves the effective workspace root path for all file operations
 * in the extension. Acts as the single source of truth for determining where
 * generated files should be placed.
 */

import { Uri, workspace } from 'vscode';

import { ExtensionConfig } from '../configs';

/**
 * Returns the workspace root path used as the base for all file operations.
 *
 * Resolution order:
 * 1. Workspace folder containing the target URI.
 * 2. First VS Code workspace folder — fallback for single-folder workspaces
 *    or when no target URI is available.
 * 3. `undefined` — when no workspace is open.
 *
 * @param config - The active extension configuration instance.
 * @returns Absolute filesystem path to the workspace root,
 *   or `undefined` if no workspace is available.
 */
export const getWorkspaceRoot = (
  config: ExtensionConfig,
  targetUri?: Uri,
): string | undefined => {
  if (targetUri) {
    const targetWorkspaceFolder = workspace.getWorkspaceFolder(targetUri);

    if (targetWorkspaceFolder) {
      return targetWorkspaceFolder.uri.fsPath;
    }
  }

  const workspaceSelection = (
    config as ExtensionConfig & { workspaceSelection?: string }
  ).workspaceSelection;

  return workspaceSelection || workspace.workspaceFolders?.[0]?.uri.fsPath;
};
