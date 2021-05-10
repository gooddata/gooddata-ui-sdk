// (C) 2019 GoodData Corporation
import React, { createContext, useContext, useDebugValue, useState } from "react";
import noop from "lodash/noop";
import { ISinglePlaceholder, IGroupPlaceholder } from "./base";

/**
 * @internal
 */
export type PlaceholdersState = {
    placeholders: Record<string, ISinglePlaceholder<any>>;
    groupPlaceholders: Record<string, IGroupPlaceholder<any>>;
};

/**
 * @internal
 */
interface IPlaceholdersContextState {
    state: PlaceholdersState;
    updateState: (callback: (state: PlaceholdersState) => PlaceholdersState) => void;
}

/**
 * @internal
 */
const PlaceholdersContext = createContext<IPlaceholdersContextState>({
    state: {
        placeholders: {},
        groupPlaceholders: {},
    },
    updateState: noop,
});
PlaceholdersContext.displayName = "PlaceholdersContext";

/**
 * @internal
 */
export const usePlaceholdersContext = (): IPlaceholdersContextState => useContext(PlaceholdersContext);

/**
 * @public
 */
export interface IPlaceholdersProviderProps {
    children: React.ReactNode;
}

/**
 * @public
 */
export function PlaceholdersProvider(props: IPlaceholdersProviderProps): JSX.Element {
    const { children } = props;
    const [state, updateState] = useState<PlaceholdersState>({
        placeholders: {},
        groupPlaceholders: {},
    });
    useDebugValue(state);

    return (
        <PlaceholdersContext.Provider
            value={{
                state,
                updateState,
            }}
        >
            {children}
        </PlaceholdersContext.Provider>
    );
}
