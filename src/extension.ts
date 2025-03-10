// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCodeMarketplaceClient } from 'vscode-marketplace-client';

// Import the Configs, Controllers, and Providers
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
  GenerateTypeCommand,
  GenerateVariableCommand,
} from './app/commands';
import {
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  ExtensionConfig,
  USER_PUBLISHER,
} from './app/configs';
import { CommandInvoker } from './app/controllers';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // The code you place here will be executed every time your command is executed
  let resource: vscode.WorkspaceFolder | undefined;

  // Check if there are workspace folders
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    const message = vscode.l10n.t(
      'No workspace folders are open. Please open a workspace folder to use this extension',
    );
    vscode.window.showErrorMessage(message);
    return;
  }

  // Optionally, prompt the user to select a workspace folder if multiple are available
  if (vscode.workspace.workspaceFolders.length === 1) {
    resource = vscode.workspace.workspaceFolders[0];
  } else {
    const placeHolder = vscode.l10n.t(
      'Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
    );
    const selectedFolder = await vscode.window.showWorkspaceFolderPick({
      placeHolder,
    });

    resource = selectedFolder;
  }

  // -----------------------------------------------------------------
  // Initialize the extension
  // -----------------------------------------------------------------

  // Get the configuration for the extension
  const config = new ExtensionConfig(
    vscode.workspace.getConfiguration(EXTENSION_ID, resource?.uri),
  );

  // Watch for changes in the configuration
  vscode.workspace.onDidChangeConfiguration((event) => {
    const workspaceConfig = vscode.workspace.getConfiguration(
      EXTENSION_ID,
      resource?.uri,
    );

    if (event.affectsConfiguration(`${EXTENSION_ID}.enable`, resource?.uri)) {
      const isEnabled = workspaceConfig.get<boolean>('enable');

      config.update(workspaceConfig);

      if (isEnabled) {
        const message = vscode.l10n.t(
          'The {0} extension is now enabled and ready to use',
          [EXTENSION_DISPLAY_NAME],
        );
        vscode.window.showInformationMessage(message);
      } else {
        const message = vscode.l10n.t('The {0} extension is now disabled', [
          EXTENSION_DISPLAY_NAME,
        ]);
        vscode.window.showInformationMessage(message);
      }
    }

    if (event.affectsConfiguration(EXTENSION_ID, resource?.uri)) {
      config.update(workspaceConfig);
    }
  });

  // -----------------------------------------------------------------
  // Get version of the extension
  // -----------------------------------------------------------------

  // Get the previous version of the extension
  const previousVersion = context.globalState.get('version');
  // Get the current version of the extension
  const currentVersion = context.extension.packageJSON.version;

  // Check if the extension is running for the first time
  if (!previousVersion) {
    const message = vscode.l10n.t(
      'Welcome to {0} version {1}! The extension is now active',
      [EXTENSION_DISPLAY_NAME, currentVersion],
    );
    vscode.window.showInformationMessage(message);

    // Update the version in the global state
    context.globalState.update('version', currentVersion);
  }

  // Check if the extension has been updated
  if (previousVersion && previousVersion !== currentVersion) {
    const actions: vscode.MessageItem[] = [
      {
        title: vscode.l10n.t('Release Notes'),
      },
      {
        title: vscode.l10n.t('Dismiss'),
      },
    ];

    const message = vscode.l10n.t(
      "The {0} extension has been updated. Check out what's new in version {1}",
      [EXTENSION_DISPLAY_NAME, currentVersion],
    );
    vscode.window.showInformationMessage(message, ...actions).then((option) => {
      if (!option) {
        return;
      }

      // Handle the actions
      switch (option?.title) {
        case actions[0].title:
          vscode.env.openExternal(
            vscode.Uri.parse(
              `https://marketplace.visualstudio.com/items/${USER_PUBLISHER}.${EXTENSION_NAME}/changelog`,
            ),
          );
          break;

        default:
          break;
      }
    });

    // Update the version in the global state
    context.globalState.update('version', currentVersion);
  }

  // -----------------------------------------------------------------
  // Check for updates
  // -----------------------------------------------------------------

  // Check for updates to the extension
  try {
    // Retrieve the latest version
    VSCodeMarketplaceClient.getLatestVersion(
      USER_PUBLISHER,
      EXTENSION_NAME,
    ).then((latestVersion) => {
      // Check if the latest version is different from the current version
      if (latestVersion !== currentVersion) {
        const actions: vscode.MessageItem[] = [
          {
            title: vscode.l10n.t('Update Now'),
          },
          {
            title: vscode.l10n.t('Dismiss'),
          },
        ];

        const message = vscode.l10n.t(
          'A new version of {0} is available. Update to version {1} now',
          [EXTENSION_DISPLAY_NAME, latestVersion],
        );
        vscode.window
          .showInformationMessage(message, ...actions)
          .then(async (option) => {
            if (!option) {
              return;
            }

            // Handle the actions
            switch (option?.title) {
              case actions[0].title:
                await vscode.commands.executeCommand(
                  'workbench.extensions.action.install.anotherVersion',
                  `${USER_PUBLISHER}.${EXTENSION_NAME}`,
                );
                break;

              default:
                break;
            }
          });
      }
    });
  } catch (error) {
    console.error('Error retrieving extension version:', error);
  }

  // -----------------------------------------------------------------
  // Register the commands
  // -----------------------------------------------------------------

  // Create a new invoker
  const invoker = new CommandInvoker(config.enable);

  // Define the commands and their corresponding handlers
  const commands = [
    {
      name: 'generateClass',
      handler: new GenerateClassCommand(config, context.extensionUri),
    },
    {
      name: 'generateInterface',
      handler: new GenerateInterfaceCommand(config, context.extensionUri),
    },
    {
      name: 'generateEnum',
      handler: new GenerateEnumCommand(config, context.extensionUri),
    },
    {
      name: 'generateType',
      handler: new GenerateTypeCommand(config, context.extensionUri),
    },
    {
      name: 'generateFunction',
      handler: new GenerateFunctionCommand(config, context.extensionUri),
    },
    {
      name: 'generateVariable',
      handler: new GenerateVariableCommand(config, context.extensionUri),
    },
    {
      name: 'generateCustomComponent',
      handler: new GenerateCustomComponentCommand(config, context.extensionUri),
    },
    {
      name: 'generateNodeModule',
      handler: new GenerateNodeModuleCommand(config, context.extensionUri),
    },
    {
      name: 'generateNodeServer',
      handler: new GenerateNodeServerCommand(config, context.extensionUri),
    },
    {
      name: 'generateExpressController',
      handler: new GenerateExpressControllerCommand(
        config,
        context.extensionUri,
      ),
    },
    {
      name: 'generateExpressMiddleware',
      handler: new GenerateExpressMiddlewareCommand(
        config,
        context.extensionUri,
      ),
    },
    {
      name: 'generateExpressRoute',
      handler: new GenerateExpressRouteCommand(config, context.extensionUri),
    },
    {
      name: 'generateExpressServer',
      handler: new GenerateExpressServerCommand(config, context.extensionUri),
    },
    {
      name: 'generateFastifyController',
      handler: new GenerateFastifyControllerCommand(
        config,
        context.extensionUri,
      ),
    },
    {
      name: 'generateFastifyMiddleware',
      handler: new GenerateFastifyMiddlewareCommand(
        config,
        context.extensionUri,
      ),
    },
    {
      name: 'generateFastifyRoute',
      handler: new GenerateFastifyRouteCommand(config, context.extensionUri),
    },
    {
      name: 'generateFastifyServer',
      handler: new GenerateFastifyServerCommand(config, context.extensionUri),
    },
  ];

  // Register the commands dynamically and push them to the context subscriptions
  commands.forEach(({ name, handler }) => {
    invoker.register(name, handler);

    const disposable = vscode.commands.registerCommand(
      `${EXTENSION_ID}.${name}`,
      async (uri: vscode.Uri) => await invoker.execute(name, uri),
    );

    context.subscriptions.push(disposable);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
