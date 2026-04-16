import {
  commands,
  ExtensionContext,
  env,
  l10n,
  MessageItem,
  Uri,
  WorkspaceFolder,
  window,
  workspace,
} from 'vscode';
import { VSCodeMarketplaceClient } from 'vscode-marketplace-client';

import {
  GenerateClassCommand,
  GenerateCustomComponentCommand,
  GenerateEnumCommand,
  GenerateExpressControllerCommand,
  GenerateExpressMiddlewareCommand,
  GenerateExpressRouteCommand,
  GenerateExpressServerCommand,
  GenerateFastifyControllerCommand,
  GenerateFastifyMiddlewareCommand,
  GenerateFastifyRouteCommand,
  GenerateFastifyServerCommand,
  GenerateFunctionCommand,
  GenerateInterfaceCommand,
  GenerateNodeModuleCommand,
  GenerateNodeServerCommand,
  GenerateReactComponentCommand,
  GenerateTypeCommand,
  GenerateVariableCommand,
} from './app/commands';
import {
  COMMANDS,
  CommandDefinition,
  CommandIds,
  ContextKeys,
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  ExtensionConfig,
  REPOSITORY_URL,
  USER_PUBLISHER,
} from './app/configs';
import { CommandInvoker } from './app/controllers';
import { detectProjectContext, getErrorMessage } from './app/helpers';
import { SmartGenerateService } from './app/services';
import {
  Command,
  ContextKey,
  EMPTY_PROJECT_CONTEXT,
  isContextActive,
  ProjectContext,
} from './app/types';

type ContextSignal = ContextKey;

type RegisteredCommandMeta = CommandDefinition & {
  handler: Command;
};

const CONTEXT_TO_VSCODE_KEY: Record<ContextSignal, string> = {
  react: `${EXTENSION_ID}.react`,
  express: `${EXTENSION_ID}.express`,
  fastify: `${EXTENSION_ID}.fastify`,
};

/**
 * Orchestrates extension lifecycle, configuration, context, and command wiring.
 *
 * @remarks
 * This runtime is the application boundary between VS Code APIs and internal
 * command/services layers.
 *
 * It coordinates workflow but intentionally avoids business rules that belong
 * to helpers and services.
 *
 * This runtime does NOT:
 * - Render generation templates
 * - Implement command ranking logic
 * - Perform low-level file writes directly
 *
 * @category Runtime
 * @internal
 */
export class ExtensionRuntime {
  /**
   * Avoids repeated disabled-state notifications across command invocations.
   */
  private hasDisabledWarningBeenShown = false;

  /**
   * Current workspace-scoped extension configuration.
   */
  private config!: ExtensionConfig;

  /**
   * In-memory snapshot of detected project context keys.
   */
  private readonly detectedContexts: ProjectContext = {
    ...EMPTY_PROJECT_CONTEXT,
  };

  /**
   * Stateless service instance used to rank Smart Generate command options.
   */
  private readonly smartGenerateService = new SmartGenerateService();

  /**
   * Creates the runtime with activation context from VS Code.
   *
   * @param context - Activation context provided by VS Code.
   */
  constructor(private readonly context: ExtensionContext) {}

  /**
   * Initializes workspace selection, configuration, and startup checks.
   *
   * @returns `true` when runtime can start command registration.
   * @example
   * const ready = await runtime.initialize();
   */
  async initialize(): Promise<boolean> {
    const workspaceFolder = await this.selectWorkspaceFolder();

    if (!workspaceFolder) {
      return false;
    }

    this.initializeConfiguration(workspaceFolder);
    await this.setContextKeys(workspaceFolder.uri);

    if (!this.isExtensionEnabled()) {
      return false;
    }

    this.startVersionChecks();

    return true;
  }

  /**
   * Starts command registration after successful initialization.
   *
   * @remarks
   * Keeps orchestration in runtime while generation behavior remains in services.
   */
  start(): void {
    this.registerWorkspaceCommands();
    this.registerGeneratorCommands();
  }

  /**
   * Runs non-blocking version checks after startup.
   */
  private startVersionChecks(): void {
    void this.handleLocalVersionNotifications();
    void this.checkMarketplaceVersion();
  }

  /**
   * Returns the extension version declared in package metadata.
   */
  private getCurrentVersion(): string {
    return this.context.extension.packageJSON?.version ?? '0.0.0';
  }

  /**
   * Handles first-run and local update notifications.
   */
  private async handleLocalVersionNotifications(): Promise<void> {
    const previousVersion = this.context.globalState.get<string>(
      ContextKeys.Version,
    );

    const currentVersion = this.getCurrentVersion();

    if (!previousVersion) {
      const welcomeMessage = l10n.t(
        'Welcome to {0} version {1}! The extension is now active',
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      window.showInformationMessage(welcomeMessage);

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );

      return;
    }

    if (previousVersion !== currentVersion) {
      const actionReleaseNotes: MessageItem = {
        title: l10n.t('Release Notes'),
      };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionReleaseNotes, actionDismiss];

      const updateMessage = l10n.t(
        "The {0} extension has been updated. Check out what's new in version {1}",
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionReleaseNotes.title) {
        const changelogUrl = `${REPOSITORY_URL}/blob/main/CHANGELOG.md`;
        env.openExternal(Uri.parse(changelogUrl));
      }

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );
    }
  }

  /**
   * Checks Marketplace for a newer published extension version.
   */
  private async checkMarketplaceVersion(): Promise<void> {
    const currentVersion = this.getCurrentVersion();

    try {
      const latestVersion = await VSCodeMarketplaceClient.getLatestVersion(
        USER_PUBLISHER,
        EXTENSION_NAME,
      );

      if (latestVersion === currentVersion) {
        return;
      }

      const actionUpdateNow: MessageItem = { title: l10n.t('Update Now') };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionUpdateNow, actionDismiss];

      const updateMessage = l10n.t(
        'A new version of {0} is available. Update to version {1} now',
        EXTENSION_DISPLAY_NAME,
        latestVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionUpdateNow.title) {
        await commands.executeCommand(
          'workbench.extensions.action.install.anotherVersion',
          `${USER_PUBLISHER}.${EXTENSION_NAME}`,
        );
      }
    } catch (error) {
      console.error('Error retrieving extension version:', error);
    }
  }

  /**
   * Selects the workspace folder that scopes configuration and generation.
   */
  private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const availableWorkspaceFolders = workspace.workspaceFolders;

    if (!availableWorkspaceFolders || availableWorkspaceFolders.length === 0) {
      const errorMessage = l10n.t(
        '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
        EXTENSION_DISPLAY_NAME,
      );
      this.showError(errorMessage);

      return undefined;
    }

    const previousFolderUriString = this.context.globalState.get<string>(
      ContextKeys.SelectedWorkspaceFolder,
    );
    let previousFolder: WorkspaceFolder | undefined;

    if (previousFolderUriString) {
      previousFolder = availableWorkspaceFolders.find(
        (folder) => folder.uri.toString() === previousFolderUriString,
      );
    }

    if (availableWorkspaceFolders.length === 1) {
      return availableWorkspaceFolders[0];
    }

    if (previousFolder) {
      window.showInformationMessage(
        l10n.t('Using workspace folder: {0}', previousFolder.name),
      );

      return previousFolder;
    }

    const pickerPlaceholder = l10n.t(
      '{0}: Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
      EXTENSION_DISPLAY_NAME,
    );
    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder: pickerPlaceholder,
    });

    if (selectedFolder) {
      this.context.globalState.update(
        ContextKeys.SelectedWorkspaceFolder,
        selectedFolder.uri.toString(),
      );
    }

    return selectedFolder;
  }

  /**
   * Initializes workspace configuration and registers configuration listeners.
   *
   * @param selectedWorkspaceFolder - The workspace folder used to load the configuration.
   */
  private initializeConfiguration(
    selectedWorkspaceFolder: WorkspaceFolder,
  ): void {
    this.config = new ExtensionConfig(
      workspace.getConfiguration(EXTENSION_ID, selectedWorkspaceFolder.uri),
    );

    this.config.workspaceSelection = selectedWorkspaceFolder.uri.fsPath;

    workspace.onDidChangeConfiguration((configurationChangeEvent) => {
      const updatedWorkspaceConfig = workspace.getConfiguration(
        EXTENSION_ID,
        selectedWorkspaceFolder.uri,
      );

      if (
        configurationChangeEvent.affectsConfiguration(
          `${EXTENSION_ID}.enable`,
          selectedWorkspaceFolder.uri,
        )
      ) {
        const isExtensionEnabled =
          updatedWorkspaceConfig.get<boolean>('enable');

        this.config.update(updatedWorkspaceConfig);

        if (isExtensionEnabled) {
          const enabledMessage = l10n.t(
            'The {0} extension is now enabled and ready to use',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(enabledMessage);
        } else {
          const disabledMessage = l10n.t(
            'The {0} extension is now disabled',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(disabledMessage);
        }
      }

      if (
        configurationChangeEvent.affectsConfiguration(
          EXTENSION_ID,
          selectedWorkspaceFolder.uri,
        )
      ) {
        this.config.update(updatedWorkspaceConfig);
      }
    });
  }

  /**
   * Returns whether commands should execute under current configuration.
   *
   * @remarks
   * Shows a disabled warning once until the extension is re-enabled.
   */
  private isExtensionEnabled(): boolean {
    const isEnabled = this.config.enable;

    if (isEnabled) {
      this.hasDisabledWarningBeenShown = false;
      return true;
    }

    if (!this.hasDisabledWarningBeenShown) {
      this.showError(
        l10n.t(
          'The {0} extension is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        ),
      );
      this.hasDisabledWarningBeenShown = true;
    }

    return false;
  }

  /**
   * Detects project context and synchronizes runtime context keys.
   *
   * @remarks
   * Runtime only applies already detected signals; context detection rules are
   * isolated in helpers.
   */
  private async setContextKeys(resource?: Uri): Promise<void> {
    const detectedContext = await detectProjectContext({
      resource,
      workspaceSelection: this.config.workspaceSelection,
    });

    await this.applyContext(detectedContext);
  }

  /**
   * Applies detected context to runtime state and VS Code UI context keys.
   */
  private async applyContext(projectContext: ProjectContext): Promise<void> {
    this.detectedContexts.express = projectContext.express;
    this.detectedContexts.fastify = projectContext.fastify;
    this.detectedContexts.react = projectContext.react;

    await Promise.all(
      (Object.keys(CONTEXT_TO_VSCODE_KEY) as ContextSignal[]).map(
        async (signal) => {
          await commands.executeCommand(
            'setContext',
            CONTEXT_TO_VSCODE_KEY[signal],
            isContextActive(this.detectedContexts, signal),
          );
        },
      ),
    );
  }

  /**
   * Registers a command that always enforces the extension enablement gate.
   *
   * @param commandId - The unique identifier for the command.
   * @param commandHandler - The function to execute when the command is invoked.
   * @returns A disposable that removes the command registration when disposed.
   */
  private registerCommand<CommandArgs extends unknown[]>(
    commandId: string,
    commandHandler: (...args: CommandArgs) => void | Promise<void>,
  ) {
    return commands.registerCommand(commandId, async (...args: CommandArgs) => {
      if (!this.isExtensionEnabled()) {
        return;
      }

      try {
        const resource = await this.resolveExecutionResource(args);
        if (!resource) {
          this.showError(
            l10n.t(
              '{0} could not find an active folder. Select a workspace folder to continue.',
              EXTENSION_DISPLAY_NAME,
            ),
          );
          return;
        }

        return commandHandler(...([resource, ...args.slice(1)] as CommandArgs));
      } catch (error) {
        this.showError(
          l10n.t(
            '{0} failed: {1}. Verify your target folder and try again.',
            EXTENSION_DISPLAY_NAME,
            getErrorMessage(error),
          ),
        );
      }
    });
  }

  /**
   * Registers workspace selection command for multi-root workspaces.
   */
  private registerWorkspaceCommands(): void {
    const disposableChangeWorkspace = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.ChangeWorkspace}`,
      async () => {
        const pickerPlaceholder = l10n.t('Select a workspace folder to use');
        const selectedFolder = await window.showWorkspaceFolderPick({
          placeHolder: pickerPlaceholder,
        });

        if (selectedFolder) {
          this.context.globalState.update(
            ContextKeys.SelectedWorkspaceFolder,
            selectedFolder.uri.toString(),
          );

          const updatedWorkspaceConfig = workspace.getConfiguration(
            EXTENSION_ID,
            selectedFolder.uri,
          );
          this.config.update(updatedWorkspaceConfig);

          this.config.workspaceSelection = selectedFolder.uri.fsPath;
          await this.setContextKeys(selectedFolder.uri);

          window.showInformationMessage(
            l10n.t('Switched to workspace folder: {0}', selectedFolder.name),
          );
        }
      },
    );

    this.context.subscriptions.push(disposableChangeWorkspace);
  }

  /**
   * Resolves the execution resource for a command.
   *
   * If a URI is provided in the arguments, it is used directly.
   * Otherwise, attempts to infer the active folder from the workspace context.
   *
   * @param args - Command arguments passed during execution.
   * @returns The resolved URI or undefined if it cannot be determined.
   */
  private async resolveExecutionResource(
    args: unknown[],
  ): Promise<Uri | undefined> {
    const firstArg = args[0];

    if (firstArg instanceof Uri) {
      return firstArg;
    }

    const availableWorkspaceFolders = workspace.workspaceFolders;

    if (!availableWorkspaceFolders?.length) {
      this.showError(
        l10n.t(
          'No workspace folder found. Open a folder before generating files.',
        ),
      );
      return undefined;
    }

    if (availableWorkspaceFolders.length === 1) {
      return availableWorkspaceFolders[0].uri;
    }

    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder: l10n.t('Select a target folder'),
    });

    return selectedFolder?.uri;
  }

  /**
   * Shows a user-facing error through VS Code notifications.
   */
  private showError(message: string): void {
    window.showErrorMessage(message);
  }

  /**
   * Registers generator commands and the Smart Generate picker entrypoint.
   *
   * @remarks
   * This method wires UI and handlers, while generation behavior remains in
   * command and service layers.
   */
  private registerGeneratorCommands(): void {
    const invoker = new CommandInvoker(this.config.enable);

    const registeredCommands: RegisteredCommandMeta[] = COMMANDS.map(
      (meta) => ({
        ...meta,
        handler: this.createCommandHandler(meta.id),
      }),
    );

    registeredCommands.forEach(({ id, handler }) => {
      invoker.register(id, handler);

      const disposable = this.registerCommand(
        `${EXTENSION_ID}.${id}`,
        async (uri: Uri) => await invoker.execute(id, uri),
      );

      this.context.subscriptions.push(disposable);
    });

    const disposableSmartGenerate = this.registerCommand(
      `${EXTENSION_ID}.${CommandIds.Generate}`,
      async (uri: Uri) => {
        const sortedCommands = this.smartGenerateService.sortByContextRelevance(
          COMMANDS,
          this.detectedContexts,
        );
        const quickPickItems = sortedCommands.map((command) => ({
          label: l10n.t(command.ui.label),
          detail: l10n.t(command.ui.detail),
          commandId: command.id,
        }));

        const selectedItem = await window.showQuickPick(quickPickItems, {
          placeHolder: l10n.t('Select a file type'),
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (!selectedItem || !('commandId' in selectedItem)) {
          return;
        }

        await invoker.execute(selectedItem.commandId, uri);
      },
    );

    this.context.subscriptions.push(disposableSmartGenerate);
  }

  /**
   * Resolves a concrete command handler by command identifier.
   */
  private createCommandHandler(commandId: CommandIds): Command {
    const commandHandlers: Partial<Record<CommandIds, Command>> = {
      [CommandIds.GenerateClass]: new GenerateClassCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateInterface]: new GenerateInterfaceCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateEnum]: new GenerateEnumCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateType]: new GenerateTypeCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateFunction]: new GenerateFunctionCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateVariable]: new GenerateVariableCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateCustomComponent]: new GenerateCustomComponentCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateNodeModule]: new GenerateNodeModuleCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateNodeServer]: new GenerateNodeServerCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateExpressController]:
        new GenerateExpressControllerCommand(
          this.config,
          this.context.extensionUri,
        ),
      [CommandIds.GenerateExpressMiddleware]:
        new GenerateExpressMiddlewareCommand(
          this.config,
          this.context.extensionUri,
        ),
      [CommandIds.GenerateExpressRoute]: new GenerateExpressRouteCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateExpressServer]: new GenerateExpressServerCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateFastifyController]:
        new GenerateFastifyControllerCommand(
          this.config,
          this.context.extensionUri,
        ),
      [CommandIds.GenerateFastifyMiddleware]:
        new GenerateFastifyMiddlewareCommand(
          this.config,
          this.context.extensionUri,
        ),
      [CommandIds.GenerateFastifyRoute]: new GenerateFastifyRouteCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateFastifyServer]: new GenerateFastifyServerCommand(
        this.config,
        this.context.extensionUri,
      ),
      [CommandIds.GenerateReactComponent]: new GenerateReactComponentCommand(
        this.config,
        this.context.extensionUri,
      ),
    };

    const handler = commandHandlers[commandId];

    if (!handler) {
      throw new Error(`Missing command handler for "${commandId}"`);
    }

    return handler;
  }
}
