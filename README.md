# Auto TS Generator

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/imgildev.vscode-typescript-generator?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/imgildev.vscode-typescript-generator?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-typescript-generator&ssr=false#review-details)
[![GitHub Repo stars](https://img.shields.io/github/stars/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator)
[![GitHub license](https://img.shields.io/github/license/ManuelGil/vscode-typescript-generator?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-typescript-generator/blob/main/LICENSE)

**Auto TS Generator** is a Visual Studio Code extension that streamlines TypeScript development by generating commonly used TypeScript files with customizable templates. Whether you're working on a class, interface, enum, or custom component, Auto TS Generator helps you automate the process with ease.

![Auto TS Generator](https://raw.githubusercontent.com/ManuelGil/vscode-typescript-generator/main/images/auto-ts-generator.gif)

## Index

- [Auto TS Generator](#auto-ts-generator)
  - [Index](#index)
  - [Key Features](#key-features)
  - [Requirements](#requirements)
  - [Project Setup](#project-setup)
  - [Settings Configuration](#settings-configuration)
  - [Custom Templates](#custom-templates)
  - [Template Variables](#template-variables)
  - [Follow Me](#follow-me)
  - [VSXpert Template](#vsxpert-template)
  - [Other Extensions](#other-extensions)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changelog](#changelog)
  - [License](#license)

## Key Features

- **Customizable Templates**: Tailor TypeScript file templates (e.g., classes, interfaces, enums, services, components) to your project’s needs.
- **Dynamic Variables**: Use powerful variable placeholders to dynamically populate file names, extensions, dates, authors, and more.
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
        "autoTS.files.includeTypeInFileName": false,
        "autoTS.files.skipTypeSelection": true,
        "autoTS.files.autoImport": false,
        "autoTS.files.defaultBarrelFileName": "index",
        "autoTS.formatting.useSingleQuotes": true,
        "autoTS.formatting.excludeSemiColonAtEndOfLine": false,
        "autoTS.formatting.keepExtensionOnExport": false,
        "autoTS.formatting.endOfLine": "lf",
        "autoTS.formatting.useStrict": false,
        "autoTS.formatting.headerCommentTemplate": [],
        "autoTS.formatting.insertFinalNewline": true,
        "autoTS.project.author": "Jane Doe",
        "autoTS.project.owner": "Jane Doe",
        "autoTS.project.maintainers": "Jane Doe, John Doe",
        "autoTS.project.license": "MIT",
        "autoTS.project.version": "1.0.0",
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
                    "export class {{fileNamePascalCase}}Service {",
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
                    "  selector: 'app-{{fileName}}',",
                    "  templateUrl: './{{fileName}}.component.html',",
                    "  styleUrls: ['./{{fileName}}.component.scss']",
                    "})",
                    "export class {{fileNamePascalCase}}Component implements OnInit {",
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
- `autoTS.files.includeTypeInFileName`: Add the type to the file name (e.g., `myNewFile.component`). Default is `false`.
- `autoTS.files.skipTypeSelection`: Skip the type selection dialog when creating files. Default is `true`.
- `autoTS.files.autoImport`: Automatically imports generated files. Default is `false`.
- `autoTS.files.defaultBarrelFileName`: Default name for barrel files (e.g., `index`). Default is `index`.
- `autoTS.formatting.useSingleQuotes`: Format code with single quotes. Default is `true`.
- `autoTS.formatting.excludeSemiColonAtEndOfLine`: Exclude semicolons at the end of lines. Default is `false`.
- `autoTS.formatting.keepExtensionOnExport`: Keep file extension on exports. Default is `false`.
- `autoTS.formatting.endOfLine`: Set the end-of-line character (e.g., `lf`). Default is `lf`.
- `autoTS.formatting.useStrict`: Enable strict mode in generated files. Default is `false`.
- `autoTS.formatting.headerCommentTemplate`: Custom header comment template for generated files. Default is an empty array.
- `autoTS.formatting.insertFinalNewline`: Insert a final newline at the end of files. Default is `true`.
- `autoTS.project.author`: Set the author of the project. Default is an empty string.
- `autoTS.project.owner`: Set the owner of the project. Default is an empty string.
- `autoTS.project.maintainers`: Set the maintainers of the project. Default is an empty string.
- `autoTS.project.license`: Set the license of the project. Default is `MIT`.
- `autoTS.project.version`: Set the version of the project. Default is `1.0.0`.
- `autoTS.templates.customComponents`: Custom templates for generating components (e.g., services, components). Default is an empty array.

You can modify these settings to suit your project's requirements and coding standards.

## Custom Templates

You can create custom templates for generating TypeScript files by adding them to the `autoTS.templates.customComponents` array in your `.vscode/settings.json` file. Each template should include the following properties:

- `name`: The name of the template (e.g., `Service`).
- `description`: A brief description of the template (e.g., `Generates a service file`).
- `type`: The type of file to generate (e.g., `service`). This value is used to set the file name when the `autoTS.files.includeTypeInFileName` setting is `true`.
- `template`: An array of strings representing the template content. You can use template variables to dynamically populate file names and other values.

## Template Variables

Auto TS Generator provides dynamic template variables for enhanced flexibility:

| Variable | Description | Example Value |
|---------------------------|-------------------------------------------------------|------------------------|
| `{{fileName}}` | Original file name | `myNewFile` |
| `{{fileNameCamelCase}}` | CamelCase format | `myNewFile` |
| `{{fileNamePascalCase}}` | PascalCase format | `MyNewFile` |
| `{{fileNameKebabCase}}` | kebab-case format | `my-new-file` |
| `{{fileNameSnakeCase}}` | snake_case format | `my_new_file` |
| `{{fileNameConstantCase}}` | CONSTANT_CASE format | `MY_NEW_FILE` |
| `{{fileNameDotCase}}` | dot.case format | `my.new.file` |
| `{{fileNamePathCase}}` | path/case format | `my/new/file` |
| `{{fileNameSentenceCase}}` | Sentence case format | `My new file` |
| `{{fileNameLowerCase}}` | Lowercase format | `my new file` |
| `{{fileNameTitleCase}}` | Title Case format | `My New File` |
| `{{fileNamePluralCase}}` | Pluralized format | `myNewFiles` |
| `{{fileNameSingularCase}}` | Singularized format | `myNewFile` |
| `{{fileNameWithTypeAndExtention}}` | File name with type and extension | `myNewFile.component.ts` |
| `{{fileNameWithType}}` | File name with type | `myNewFile.component` |
| `{{fileNameWithExtention}}` | File name with extension | `myNewFile.ts` |
| `{{folderName}}` | Parent folder name | `src/components` |
| `{{fileType}}` | File type (component, service, etc.) | `component` |
| `{{fileTypeName}}` | File type in Title Case format | `Service` |
| `{{fileTypeNameCamelCase}}` | File type in camelCase format | `service` |
| `{{fileTypeNamePascalCase}}` | File type in PascalCase format | `Service` |
| `{{fileTypeNameKebabCase}}` | File type in kebab-case format | `service` |
| `{{fileTypeNameSnakeCase}}` | File type in snake_case format | `service` |
| `{{fileTypeNameConstantCase}}` | File type in CONSTANT_CASE format | `SERVICE` |
| `{{fileTypeNameDotCase}}` | File type in dot.case format | `service` |
| `{{fileTypeNamePathCase}}` | File type in path/case format | `service` |
| `{{fileTypeNameSentenceCase}}` | File type in Sentence case format | `Service` |
| `{{fileTypeNameLowerCase}}` | File type in lowercase | `service` |
| `{{fileTypeNameUpperCase}}` | File type in uppercase | `SERVICE` |
| `{{fileTypeNamePlural}}` | File type converted to plural | `services` |
| `{{fileTypeNameSingular}}` | File type converted to singular | `service` |
| `{{fileTypeWithExtention}}` | File type including extension | `service.ts` |
| `{{fileExtension}}` | File extension | `ts` |
| `{{date}}` | Current date | `2025-01-31` |
| `{{year}}` | Current year | `2025` |
| `{{time}}` | Current time | `12:34:56` |
| `{{timestamp}}` | Unix timestamp | `1672531199` |
| `{{timestampISO}}` | ISO timestamp | `2025-01-31T12:34:56Z` |
| `{{author}}` | Project author | `Jane Doe` |
| `{{owner}}` | Project owner | `Jane Doe` |
| `{{maintainers}}` | Project maintainers | `Jane Doe, John Doe` |
| `{{license}}` | Project license | `MIT` |
| `{{version}}` | Project version | `1.0.0` |

These variables allow you to create highly flexible templates that adapt to different file naming conventions and project structures.

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
