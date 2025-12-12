// (C) 2025 GoodData Corporation

import { type ComponentType, type ReactNode, createContext, useContext } from "react";

import { type PivotTableNextConfig } from "../types/public.js";

/**
 * @alpha
 */
export const AgGridTokenContext = createContext<{ agGridToken: string | undefined }>({
    agGridToken: undefined,
});

/**
 * @alpha
 */
export function AgGridTokenProvider({ token, children }: { token: string; children?: ReactNode }) {
    return (
        <AgGridTokenContext.Provider value={{ agGridToken: token }}>{children}</AgGridTokenContext.Provider>
    );
}

/**
 * @internal
 */
export function withAgGridToken<T extends { config?: PivotTableNextConfig }>(
    InnerComponent: ComponentType<T>,
): ComponentType<T> {
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
