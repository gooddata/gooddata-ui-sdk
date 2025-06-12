// (C) 2024 GoodData Corporation

import * as React from "react";

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
const headerSearchContext = React.createContext<HeaderSearchContext>({
    isOpen: false,
    toggleOpen: () => {},
});

/**
 * Internal context Provider used to provide header search drop-down state to the components.
 * @internal
 */
export const HeaderSearchProvider = ({ children, ...rest }: React.PropsWithChildren<HeaderSearchContext>) => {
    const Provider = headerSearchContext.Provider;

    return <Provider value={rest}>{children}</Provider>;
};

/**
 * Internal context hook used to provide header search drop-down state to the components.
 * @internal
 */
export const useHeaderSearch = () => React.useContext(headerSearchContext);
