// (C) 2025 GoodData Corporation

// Since vitest-dom@0.1.1 has a type error (duplicate 'element' parameter in toContainElement),
// we define the types manually here instead of importing from vitest-dom

export interface MatcherResult {
    pass: boolean;
    message: () => string;
}

export type TestingLibraryMatchers<_E, R> = {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeEmptyDOMElement(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toContainElement(element: HTMLElement | SVGElement | null): R;
    toContainHTML(html: string): R;
    toHaveAccessibleDescription(expectedDescription?: string): R;
    toHaveAccessibleName(expectedName?: string): R;
    toHaveAttribute(attribute: string, value?: string): R;
    toHaveClass(...classes: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, any>): R;
    toHaveStyle(css: string | Record<string, any>): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
    toHaveValue(value?: string | string[] | number): R;
    toHaveDisplayValue(value?: string | string[]): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveErrorMessage(message?: string): R;
};

declare module "vitest" {
    // Extend Vitest's Assertion interface with vitest-dom matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // Extend AsymmetricMatchersContaining for asymmetric matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

// This ensures the file is treated as a module
export {};
