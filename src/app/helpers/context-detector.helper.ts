import { RelativePattern, Uri, WorkspaceFolder, workspace } from 'vscode';
import { EMPTY_PROJECT_CONTEXT, ProjectContext } from '../types';
import { readFileContent } from './read-file-content.helper';

type PackageJsonData = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/**
 * Detects project context using lightweight multi-signal checks.
 *
 * The implementation is intentionally bounded to avoid expensive workspace scans:
 * - `package.json` is read once when available
 * - `tsconfig.json` lookup is capped to 1 result
 * - `*.ts` / `*.tsx` lookup is capped to 3 results
 */
export const detectProjectContext = async (options: {
  resource?: Uri;
  workspaceSelection?: string;
}): Promise<ProjectContext> => {
  const workspaceFolder = resolveWorkspaceFolder(
    options.resource,
    options.workspaceSelection,
  );

  if (!workspaceFolder) {
    return EMPTY_PROJECT_CONTEXT;
  }

  const packageSignals = await detectPackageJsonSignals(workspaceFolder);
  const hasTsConfig = await detectTsConfig(workspaceFolder);
  const tsFilesSignals = await detectTsFiles(workspaceFolder);

  const hasTypeScriptDependency =
    packageSignals.dependencyNames.has('typescript') ||
    packageSignals.dependencyNames.has('ts-node') ||
    packageSignals.dependencyNames.has('tsx');

  const hasReactDependency =
    packageSignals.dependencyNames.has('react') ||
    packageSignals.dependencyNames.has('react-dom') ||
    packageSignals.dependencyNames.has('next');

  return {
    isTypeScript:
      hasTsConfig || tsFilesSignals.hasTsFiles || hasTypeScriptDependency,
    isNode: packageSignals.hasPackageJson,
    hasExpress: packageSignals.dependencyNames.has('express'),
    hasFastify: packageSignals.dependencyNames.has('fastify'),
    isReact:
      hasReactDependency ||
      (tsFilesSignals.hasTsFiles && tsFilesSignals.containsTsxFiles),
  };
};

/**
 * Resolves the workspace folder to inspect for context detection.
 */
const resolveWorkspaceFolder = (
  resource?: Uri,
  workspaceSelection?: string,
): WorkspaceFolder | undefined => {
  if (resource) {
    return workspace.getWorkspaceFolder(resource);
  }

  if (workspaceSelection) {
    return workspace.workspaceFolders?.find(
      (folder) => folder.uri.fsPath === workspaceSelection,
    );
  }

  return workspace.workspaceFolders?.[0];
};

/**
 * Reads `package.json` once and extracts a flattened dependency set.
 */
const detectPackageJsonSignals = async (
  workspaceFolder: WorkspaceFolder,
): Promise<{ hasPackageJson: boolean; dependencyNames: Set<string> }> => {
  try {
    const packageJsonUri = Uri.joinPath(workspaceFolder.uri, 'package.json');
    const packageJsonText = await readFileContent(packageJsonUri);
    const packageJson = JSON.parse(packageJsonText) as PackageJsonData;

    return {
      hasPackageJson: true,
      dependencyNames: new Set<string>([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
        ...Object.keys(packageJson.optionalDependencies ?? {}),
      ]),
    };
  } catch {
    return {
      hasPackageJson: false,
      dependencyNames: new Set<string>(),
    };
  }
};

/**
 * Detects whether a `tsconfig.json` exists in the target workspace.
 */
const detectTsConfig = async (
  workspaceFolder: WorkspaceFolder,
): Promise<boolean> => {
  try {
    const results = await workspace.findFiles(
      new RelativePattern(workspaceFolder, '**/tsconfig.json'),
      '**/node_modules/**',
      1,
    );

    return results.length > 0;
  } catch {
    return false;
  }
};

/**
 * Detects lightweight TypeScript file signals with bounded file search.
 */
const detectTsFiles = async (
  workspaceFolder: WorkspaceFolder,
): Promise<{ hasTsFiles: boolean; containsTsxFiles: boolean }> => {
  try {
    const results = await workspace.findFiles(
      new RelativePattern(workspaceFolder, '**/*.{ts,tsx}'),
      '**/node_modules/**',
      3,
    );

    return {
      hasTsFiles: results.length > 0,
      containsTsxFiles: results.some((fileUri) =>
        fileUri.path.endsWith('.tsx'),
      ),
    };
  } catch {
    return {
      hasTsFiles: false,
      containsTsxFiles: false,
    };
  }
};
