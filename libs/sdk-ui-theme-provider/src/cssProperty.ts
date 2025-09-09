// (C) 2021-2025 GoodData Corporation

/**
 * @internal
 */
export type CssProperty = {
    key: string;
    value: string;
};

/**
 * @internal
 */
export const getCssProperty = (key: string, value: string): CssProperty | null =>
    value
        ? {
              key: `--gd-${key}`,
              value,
          }
        : null;
