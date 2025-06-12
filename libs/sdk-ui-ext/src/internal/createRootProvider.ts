// (C) 2023 GoodData Corporation

/**
 * React18 Root type.
 *
 * @public
 */
export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
}

/**
 * React18 createRoot function type.
 *
 * @public
 */
export type CreateRoot = (container: Element | DocumentFragment, options?: any) => Root;

/**
 * Global createRoot function for React18 root creation.
 *
 * @internal
 */
export let _createRoot: CreateRoot = null;

/**
 * In order to use React18 for visualization rendering, one has to provide createRoot function.
 * Older React17 render is used by default.
 *
 * @public
 */
export function provideCreateRoot(createRoot: CreateRoot) {
    _createRoot = createRoot;
}
