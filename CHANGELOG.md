# Change Log

All notable changes to the "Auto TS Generator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2026-04-12

### Added

- Introduce a primary `Auto TS: Generate` command to centralize generation in a single contextual flow.

### Changed

- Enable quick-mode defaults: `autoTS.files.skipFolderConfirmation=true` and `autoTS.files.autoImport=true`.
- Register generation commands through shared contextual resource resolution, reducing manual folder dependency.
- Improve user-facing error messages with actionable guidance.
- Highlight primary command and quick-mode workflow in the README.
- Keep first-run onboarding informative and non-intrusive.

## [1.8.0] - 2026-04-11

### Added

- Introduce `ExtensionRuntime` to manage the extension lifecycle and core state.
- Validation scripts to ensure **l10n** keys used in source files match those defined in localization bundles.
- Validation scripts to ensure **NLS** keys in `package.json` match those in `package.nls*.json`.
- GitHub Actions workflows for automated checks.
- Dependabot configuration for dependency updates.
- Node.js version management via `.nvmrc`.
- Environment management via `.envrc`.
- A Makefile for common development tasks.

### Changed

- Simplify `activate` by delegating initialization to `ExtensionRuntime`.
- Centralize command registration, workspace selection, and update handling in a single runtime layer.
- Improve configuration handling with workspace-specific support.
- Enhance error handling and user feedback during activation and updates.
- Migrate the repository to **pnpm** for dependency management.
- Improve localization bundles and align them with actual key usage.
- Update project configuration, documentation, and changelog structure.

### Removed

- Remove unused code and outdated references.
- Remove `package-lock.json` in favor of `pnpm-lock.yaml`.

## [1.7.0] - 2025-06-12

### Added

- Add support for React Components

### Changed

- Enhance overall reliability of file generation and auto-import functionality
- Improve error handling with user-friendly notifications and proper error states

### Fixed

- Fix async handling in all command execution files
- Fix file saving mechanism in `FileGeneratorService` to use proper async/await patterns

## [1.6.0] - 2025-03-10

### Added

- Add `vscode-marketplace-client` dependency to check for extension updates and display a notification

### Changed

- Update Localization strings for the extension

## [1.5.0] - 2025-01-31

### Added

- Add new templates for TypeScript components and extend command functionalities
- Add `includeTypeInFileName` setting to include the type in the file name
- Add `skipTypeSelection` setting to skip the type selection when generating a file
- Add `author` setting to set the author of the file
- Add `owner` setting to set the owner of the file
- Add `maintainers` setting to set the maintainers of the file
- Add `license` setting to set the license of the file
- Add `version` setting to set the version of the file

## [1.4.1] - 2025-01-29

### Fixed

- Fix file extension option in the settings to include JavaScript and React file extensions

## [1.4.0] - 2025-01-22

### Added

- Add `defaultLanguage` setting to set the default language for the barrel file

### Changed

- Update the `fileExtension` setting to allow TypeScript and JavaScript file extensions

## [1.3.1] - 2025-01-19

### Fixed

- Fix the `package.json` file to include the correct settings for the extension

## [1.3.0] - 2025-01-11

### Added

- Add support for Custom File Templates. Now you can create your own file templates and use them to generate files in your project.
- Add related settings to configure the custom file templates.

### Changed

- Update the `README.md` file with more information about the extension.
- Update localizations for the extension.

## [1.2.1] - 2025-01-06

### Fixed

- Fix the `README.md` file to include the correct settings for the extension

## [1.2.0] - 2024-12-24

### Added

- Add `files.skipFolderConfirmation` settings to skip the folder confirmation when generating a file

## [1.1.0] - 2024-12-22

### Added

- Add VS Code test configuration and update test scripts

### Changed

- Improve the welcome and update messages in the extension
- Upgrade dependencies to the latest versions available

## [1.0.1] - 2024-12-19

### Changed

- Update the `README.md` file with more information about the extension.
- Update localizations for the extension.

## [1.0.0] - 2024-12-19

### Added

- Initial release of the extension starter kit minimal.

[unreleased]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.9.0...HEAD
[1.9.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/ManuelGil/vscode-typescript-generator/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ManuelGil/vscode-typescript-generator/releases/tag/v1.0.0
