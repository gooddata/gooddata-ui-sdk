// (C) 2025 GoodData Corporation
import React, { useContext } from "react";

import { PivotTableNextConfig } from "./types/public.js";

/**
 * @alpha
 */
export const AgGridTokenContext = React.createContext<{ agGridToken: string | undefined }>({
    agGridToken: undefined,
});

/**
 * @alpha
 */
export function AgGridTokenProvider({ token, children }: { token: string; children?: React.ReactNode }) {
    return (
        <AgGridTokenContext.Provider value={{ agGridToken: token }}>{children}</AgGridTokenContext.Provider>
    );
}

/**
 * @internal
 */
export function withAgGridToken<T extends { config?: PivotTableNextConfig }>(
    InnerComponent: React.ComponentType<T>,
): React.ComponentType<T> {
    function AgGridTokenHOC(props: T) {
        const { agGridToken } = useContext(AgGridTokenContext);

        return (
            <>
                <InnerComponent {...props} config={enrichAgGridToken(props.config, agGridToken)} />
            </>
        );
    }

    return AgGridTokenHOC;
}

/**
 * @internal
 */
export function enrichAgGridToken<T>(
    config?: T & { agGridToken?: string },
    agGridToken?: string,
): (T & { agGridToken?: string }) | undefined {
    return agGridToken
        ? ({
              ...(config || {}),
              agGridToken: config?.agGridToken || agGridToken,
          } as T & { agGridToken?: string })
        : config;
}

/**
 * @alpha
 */
export function useAgGridToken(agGridToken?: string) {
    const context = useContext(AgGridTokenContext);

    return agGridToken ?? context.agGridToken;
}
