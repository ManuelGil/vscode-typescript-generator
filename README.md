# Auto TS Generator

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/imgildev.vscode-typescript-generator?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator&ssr=false#review-details)
[![GitHub Repo stars](https://img.shields.io/github/stars/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator)
[![GitHub license](https://img.shields.io/github/license/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator/blob/main/LICENSE)

**Auto TS Generator** is a Visual Studio Code extension that streamlines TypeScript development by generating commonly used TypeScript files with customizable templates. Whether you're working on a class, interface, enum, or custom component, Auto TS Generator helps you automate the process with ease.

## Index

- [Auto TS Generator](#auto-ts-generator)
  - [Index](#index)
  - [Key Features](#key-features)
  - [Requirements](#requirements)
  - [Project Setup](#project-setup)
  - [Settings Configuration](#settings-configuration)
  - [Follow Me](#follow-me)
  - [VSXpert Template](#vsxpert-template)
  - [Other Extensions](#other-extensions)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changelog](#changelog)
  - [License](#license)

## Key Features

- **Customizable Templates**: Tailor TypeScript file templates (e.g., classes, interfaces, enums, services, components) to your project’s needs.
- **Auto Import**: Automatically imports generated files into your project for seamless integration.
- **Project Configuration**: Easily set up project-level configurations for file formatting, structure, and more.
- **Open Source**: Contribute to the project or simply benefit from the shared work of the community.

## Requirements

- **VS Code 1.88.0** or higher.

## Project Setup

To configure **Auto TS Generator** for your project, follow these steps:

1. **Open VS Code Command Palette**:
   - Windows: `CTRL + SHIFT + P`
   - MacOS: `CMD + SHIFT + P`

2. **Open Workspace Settings**:
   - Type `Preferences: Open Workspace Settings (JSON)`.

3. **Add Configuration to `settings.json`**:
   Copy the following configuration into your `.vscode/settings.json` file:

    ```json
    {
        "autoTS.enable": true,
        "autoTS.files.defaultLanguage": "TypeScript",
        "autoTS.files.fileExtension": "ts",
        "autoTS.files.skipFolderConfirmation": false,
        "autoTS.files.autoImport": false,
        "autoTS.files.defaultBarrelFileName": "index",
        "autoTS.formatting.useSingleQuotes": true,
        "autoTS.formatting.excludeSemiColonAtEndOfLine": false,
        "autoTS.formatting.keepExtensionOnExport": false,
        "autoTS.formatting.endOfLine": "lf",
        "autoTS.formatting.useStrict": false,
        "autoTS.formatting.headerCommentTemplate": [],
        "autoTS.formatting.insertFinalNewline": true,
        "autoTS.templates.customComponents": [
            {
                "name": "Service",
                "description": "Generates a service file",
                "type": "service",
                "template": [
                    "import { Injectable } from '@angular/core';",
                    "",
                    "@Injectable({",
                    "  providedIn: 'root'",
                    "})",
                    "export class {{ComponentName}}Service {",
                    "",
                    "  constructor() { }",
                    "",
                    "}"
                ]
            },
            {
                "name": "Component",
                "description": "Generates a component file",
                "type": "component",
                "template": [
                    "import { Component, OnInit } from '@angular/core';",
                    "",
                    "@Component({",
                    "  selector: 'app-{{ComponentName}}',",
                    "  templateUrl: './{{ComponentName}}.component.html',",
                    "  styleUrls: ['./{{ComponentName}}.component.scss']",
                    "})",
                    "export class {{ComponentName}}Component implements OnInit {",
                    "",
                    "  constructor() { }",
                    "",
                    "  ngOnInit(): void { }",
                    "",
                    "}"
                ]
            }
        ]
    }
    ```

4. **Restart VS Code** to apply the settings.

## Settings Configuration

You can customize the behavior of **Auto TS Generator** by modifying the settings in your `.vscode/settings.json` file. Below is a list of configurable options:

- `autoTS.enable`: Toggle the extension on or off. Default is `true`.
- `autoTS.files.defaultLanguage`: Set the default language for generated files. Default is `TypeScript`.
- `autoTS.files.fileExtension`: Set the file extension for generated files. Default is `.ts`.
- `autoTS.files.skipFolderConfirmation`: Skip the folder confirmation dialog when creating files. Default is `false`.
- `autoTS.files.autoImport`: Automatically imports generated files. Default is `false`.
- `autoTS.files.defaultBarrelFileName`: Default name for barrel files (e.g., `index`). Default is `index`.
- `autoTS.formatting.useSingleQuotes`: Format code with single quotes. Default is `true`.
- `autoTS.formatting.excludeSemiColonAtEndOfLine`: Exclude semicolons at the end of lines. Default is `false`.
- `autoTS.formatting.keepExtensionOnExport`: Keep file extension on exports. Default is `false`.
- `autoTS.formatting.endOfLine`: Set the end-of-line character (e.g., `lf`). Default is `lf`.
- `autoTS.formatting.useStrict`: Enable strict mode in generated files. Default is `false`.
- `autoTS.templates.customComponents`: Custom templates for generating components (e.g., services, components). Default is an empty array.

## Follow Me

Stay updated on the latest features, improvements, and future projects by following me:

- [GitHub](https://github.com/ManuelGil)
- [Twitter (X)](https://twitter.com/imgildev)

## VSXpert Template

This extension was created using [VSXpert](https://vsxpert.com), a template designed to help you quickly create Visual Studio Code extensions with ease.

## Other Extensions

Explore other extensions developed by me:

- [Angular File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-angular-generator)
- [NestJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-generator)
- [T3 Stack / NextJS / ReactJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nextjs-generator)
- [Auto Barrel](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-auto-barrel)
- [CodeIgniter 4 Spark](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-spark)

## Contributing

We welcome contributions from the community! To contribute, fork the [GitHub repository](https://github.com/ManuelGil/vscode-typescript-generator) and submit a pull request.

Before contributing, please review our [Contribution Guidelines](./CONTRIBUTING.md) for details on coding standards and best practices.

## Code of Conduct

We strive to create a welcoming, inclusive, and respectful environment for all contributors. Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating in this project.

## Changelog

See the full list of changes in the [CHANGELOG.md](./CHANGELOG.md) file.

## License

This extension is licensed under the MIT License. See the [MIT License](https://opensource.org/licenses/MIT) for more details.
