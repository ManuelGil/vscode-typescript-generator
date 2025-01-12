# Auto TS Generator

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/imgildev.vscode-typescript-generator?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator&ssr=false#review-details)
[![GitHub Repo stars](https://img.shields.io/github/stars/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator)
[![GitHub license](https://img.shields.io/github/license/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator/blob/main/LICENSE)

**Auto TS File Generator** is a VS Code extension designed to boost productivity in TypeScript projects. It allows developers to generate TypeScript files with customizable configurations effortlessly.

With a few clicks, you can create:

- **Classes**: Fully structured with constructors and placeholders for methods.
- **Interfaces**: Ready-to-use templates for defining object shapes.
- **Enums**: Easily define enumerations for your projects.
- **Types**: Generate type aliases to streamline your code.
- **Functions**: Boilerplate code for reusable logic.
- **Variables**: Predefined variables for consistent coding.
- **Custom Components**: Create custom components with your own templates.

## Table of Contents

- [Auto TS Generator](#auto-ts-generator)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Key Features](#key-features)
  - [Project Settings](#project-settings)
  - [Settings Options](#settings-options)
  - [Follow Me](#follow-me)
  - [VSXpert Template](#vsxpert-template)
  - [Other Extensions](#other-extensions)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changelog](#changelog)
  - [Authors](#authors)
  - [License](#license)

## Requirements

- VSCode 1.88.0 or later

## Key Features

- **Custom Configurations**: Choose formatting, strict mode, and comment options to match your project's style.
- **Integrated Workflow**: Seamlessly create files in your workspace folders.
- **Extensibility**: Easily extend the generator for additional use cases.
- **Open Source**: Auto TS Generator is open-source software, so you can contribute to its development and help make it even better.

## Project Settings

Configure your project by creating or updating a settings.json file at the project's root. If you already have a `.vscode/settings.json` file, skip the first two steps.

1. Open the command palette in VSCode:

   - `CTRL + SHIFT + P` (Windows)
   - `CMD + SHIFT + P` (Mac OS)

2. Type `Preferences: Open Workspace Settings (JSON)`.

3. In the `.vscode/settings.json` file, copy and paste the following settings:

    ```json
    {
        "autoTS.enable": true, // Enable or disable Auto TS Generator
        "autoTS.files.fileExtension": "ts", // The file extension for generated files
        "autoTS.files.skipFolderConfirmation": false, // Skip the folder confirmation dialog
        "autoTS.files.autoImport": false, // Automatically import generated files
        "autoTS.files.defaultBarrelFileName": "index.ts", // The default name for barrel files
        "autoTS.formatting.useSingleQuotes": true, // Use single quotes for strings
        "autoTS.formatting.excludeSemiColonAtEndOfLine": false, // Exclude semicolons at the end of lines
        "autoTS.formatting.keepExtensionOnExport": false, // Keep file extension on export
        "autoTS.formatting.endOfLine": "lf", // The end-of-line character
        "autoTS.formatting.useStrict": false, // Use strict mode in generated files
        "autoTS.formatting.headerCommentTemplate": [], // A template for header comments
        "autoTS.formatting.insertFinalNewline": true, // Insert a newline at the end of files
        "autoTS.templates.customComponents": [
            {
                "name": "Service",
                "description": "Creates a service file",
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
                "description": "Creates a component file",
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
            },
        ], // Custom components templates
    }
    ```

4. **Restart VS Code**

Your project is now set up to automatically format code upon saving.

## Settings Options

Configure Auto TS Generator settings in your `.vscode/settings.json` file to customize the extension's behavior. The following settings are available:

- `autoTS.enable`: Enable or disable Auto TS Generator. Default is `true`.
- `autoTS.files.fileExtension`: The file extension for generated files. Default is `ts`.
- `autoTS.files.skipFolderConfirmation`: Skip the folder confirmation dialog. Default is `false`.
- `autoTS.files.autoImport`: Automatically import generated files. Default is `false`.
- `autoTS.files.defaultBarrelFileName`: The default name for barrel files. Default is `index.ts`.
- `autoTS.formatting.useSingleQuotes`: Use single quotes for strings. Default is `true`.
- `autoTS.formatting.excludeSemiColonAtEndOfLine`: Exclude semicolons at the end of lines. Default is `false`.
- `autoTS.formatting.keepExtensionOnExport`: Keep file extension on export. Default is `false`.
- `autoTS.formatting.endOfLine`: The end-of-line character. Default is `lf`.
- `autoTS.formatting.useStrict`: Use strict mode in generated files. Default is `false`.
- `autoTS.formatting.headerCommentTemplate`: A template for header comments. Default is `[]`.
- `autoTS.formatting.insertFinalNewline`: Insert a newline at the end of files. Default is `true`.
- `autoTS.templates.customComponents`: Custom components templates. Default is `[]`.

The `autoTS.templates.customComponents` setting is an array of objects with the following properties:

- `name`: The name of the template. Example: "Service".
- `description`: A description of the template. Example: "Creates a service file".
- `type`: The type of component. Example: "service".
- `template`: The template content for the file. Use `{{ComponentName}}` as a placeholder for the component name.

For more information on configuring Auto TS Generator settings, refer to the [Project Settings](#project-settings) section.

## Follow Me

If you enjoy using Auto TS Generator, consider following me for updates on this and future projects:

[![GitHub followers](https://img.shields.io/github/followers/ManuelGil?style=for-the-badge&logo=github)](https://github.com/ManuelGil)
[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/imgildev?style=for-the-badge&logo=x)](https://twitter.com/imgildev)

## VSXpert Template

This extension was created using [VSXpert](https://vsxpert.com), a template that helps you create Visual Studio Code extensions with ease. VSXpert provides a simple and easy-to-use structure to get you started quickly.

## Other Extensions

- [Angular File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-angular-generator)
- [NestJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-generator)
- [T3 Stack / NextJS / ReactJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nextjs-generator)
- [Auto Barrel](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-auto-barrel)
- [CodeIgniter 4 Spark](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-spark)

## Contributing

Auto TS Generator is open-source software, and we welcome contributions from the community. If you'd like to contribute, please fork the [GitHub repository](https://github.com/ManuelGil/vscode-typescript-generator) and submit a pull request with your changes.

Before contributing, please read our [Contribution Guidelines](./CONTRIBUTING.md) for instructions on coding standards, testing, and more.

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, disability, ethnicity, religion, or similar personal characteristic. Please review our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating in our community.

## Changelog

For a complete list of changes, see the [CHANGELOG.md](./CHANGELOG.md)

## Authors

- **Manuel Gil** - _Owner_ - [ManuelGil](https://github.com/ManuelGil)

See also the list of [contributors](https://github.com/ManuelGil/vscode-typescript-generator/contributors) who participated in this project.

## License

This extension is licensed under the MIT License. See the [MIT License](https://opensource.org/licenses/MIT) for details.
