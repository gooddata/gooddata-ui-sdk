// (C) 2024-2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

/**
 * Internal context type used to provide header search drop-down state to the components.
 * @internal
 */
export type HeaderSearchContext = {
    isOpen: boolean;
    toggleOpen: () => void;
};

/**
 * Internal context used to provide header search drop-down state to the components.
 * @internal
 */
const headerSearchContext = createContext<HeaderSearchContext>({
    isOpen: false,
    toggleOpen: () => {},
});

/**
 * Internal context Provider used to provide header search drop-down state to the components.
 * @internal
 */
export function HeaderSearchProvider({ children, ...rest }: PropsWithChildren<HeaderSearchContext>) {
    const Provider = headerSearchContext.Provider;

    return <Provider value={rest}>{children}</Provider>;
}

/**
 * Internal context hook used to provide header search drop-down state to the components.
 * @internal
 */
export const useHeaderSearch = () => useContext(headerSearchContext);
