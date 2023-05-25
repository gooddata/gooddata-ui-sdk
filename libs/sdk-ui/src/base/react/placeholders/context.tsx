// (C) 2019-2023 GoodData Corporation
import React, { createContext, useContext, useDebugValue, useState } from "react";
import noop from "lodash/noop.js";
import { IPlaceholder } from "./base.js";

/**
 * @internal
 */
export type PlaceholdersState = {
    placeholders: Record<string, IPlaceholder<any>>;
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
    },
    updateState: noop,
});
PlaceholdersContext.displayName = "PlaceholdersContext";

/**
 * @internal
 */
export const usePlaceholdersContext = (): IPlaceholdersContextState => useContext(PlaceholdersContext);

/**
 * Props of the {@link PlaceholdersProvider} component.
 * @public
 */
export interface IPlaceholdersProviderProps {
    children: React.ReactNode;
    initialValues?: [IPlaceholder<any>, any][];
}

/**
 * Wraps component into a PlaceholdersContext consumer enabling the children of this to access the current
 * placeholders state.
 *
 * @public
 */
export function PlaceholdersProvider(props: IPlaceholdersProviderProps): JSX.Element {
    const { children, initialValues } = props;
    const accumulator: Record<string, IPlaceholder<any>> = {};
    const initialPlaceholdersState =
        initialValues?.reduce((acc, [placeholder, value]) => {
            acc[placeholder.id] = {
                ...placeholder,
                value,
            };
            return acc;
        }, accumulator) ?? {};

    const [state, updateState] = useState<PlaceholdersState>({
        placeholders: initialPlaceholdersState,
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
