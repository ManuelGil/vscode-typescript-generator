import { QuickPickItem } from 'vscode';
import { ContentTemplate } from '../configs';

/**
 * Transforms a content template into a VS Code Quick Pick item.
 *
 * @param template - The content template definition.
 * @returns Quick Pick item representation for UI selection.
 * @category Helpers
 */
export const generateQuickPickOption = (
  template: ContentTemplate,
): QuickPickItem => {
  return {
    label: template.name,
    description: template.description,
    detail: template.type,
  };
};

/**
 * Finds a custom component template by its display name.
 *
 * @param customComponents - Available custom component templates.
 * @param selectedTemplateName - Template name selected by the user.
 * @returns Matching template or undefined when no template matches.
 * @category Helpers
 */
export const getCustomTemplateByName = (
  customComponents: ContentTemplate[],
  selectedTemplateName: string,
): ContentTemplate | undefined => {
  return customComponents.find(
    (template) => template.name === selectedTemplateName,
  );
};
