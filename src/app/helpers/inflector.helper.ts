/**
 * Converts a tokenized string to camelCase.
 * @category Helpers
 */
export const camelize = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, '')
    .replace(/-+/g, '')
    .replace(/_+/g, '')
    .replace(/\.+/g, '')
    .replace(/\/+/g, '');
};

/**
 * Converts a tokenized string to PascalCase.
 * @category Helpers
 */
export const pascalize = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/-+/g, '')
    .replace(/_+/g, '')
    .replace(/\.+/g, '')
    .replace(/\/+/g, '');
};

/**
 * Converts a tokenized string to kebab-case.
 * @category Helpers
 */
export const kebabize = (str: string): string => {
  return str
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/\.+/g, '-')
    .replace(/\/+/g, '-')
    .toLowerCase();
};

/**
 * Converts a tokenized string to snake_case.
 * @category Helpers
 */
export const snakeize = (str: string): string => {
  return str
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/\.+/g, '_')
    .replace(/\/+/g, '_')
    .toLowerCase();
};

/**
 * Converts a tokenized string to CONSTANT_CASE.
 * @category Helpers
 */
export const constantize = (str: string): string => {
  return str
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/\.+/g, '_')
    .replace(/\/+/g, '_')
    .toUpperCase();
};

/**
 * Converts a string to Title Case.
 * @category Helpers
 */
export const titleize = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converts a string to sentence case.
 * @category Helpers
 */
export const sentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converts a string to a simple plural form.
 * @category Helpers
 */
export const pluralize = (str: string): string => {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s')) {
    return str;
  }
  return str + 's';
};

/**
 * Converts a string to a simple singular form.
 * @category Helpers
 */
export const singularize = (str: string): string => {
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y';
  }
  if (str.endsWith('s')) {
    return str.slice(0, -1);
  }
  return str;
};
