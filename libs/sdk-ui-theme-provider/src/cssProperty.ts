// (C) 2021 GoodData Corporation

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
export const getCssProperty = (key: string, value: string): CssProperty =>
    value && {
        key: `--gd-${key}`,
        value,
    };
