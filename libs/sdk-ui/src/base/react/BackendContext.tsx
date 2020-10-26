// (C) 2019 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { wrapDisplayName } from "./wrapDisplayName";

const BackendContext = React.createContext<IAnalyticalBackend | undefined>(undefined);
BackendContext.displayName = "BackendContext";

/**
 * @public
 */
export interface IBackendProviderProps {
    /**
     * Specify instance of backend which should be used by components to communicate with the server.
     */
    backend: IAnalyticalBackend;
}

/**
 * BackendProvider can be used to inject analytical backend instance to all ui-sdk components in your app.
 *
 * @public
 */
export const BackendProvider: React.FC<IBackendProviderProps> = ({ children, backend }) => {
    return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
};

/**
 * Hook to get analytical backend instance provided to BackendProvider.
 * You can optionally set a backend override that will be returned if defined.
 * This makes the usage more ergonomic (see the following example).
 *
 * @example
 * // instead of
 * const fromContext = useBackend();
 * const effectiveBackend = fromArguments ?? fromContext.
 * // you can write
 * const backend = useBackend(fromArguments);
 *
 * @param backend - backend to use instead of context value. If undefined, the context value is used.
 * @public
 */
export const useBackend = (backend?: IAnalyticalBackend): IAnalyticalBackend | undefined => {
    const backendFromContext = React.useContext(BackendContext);
    return backend ?? backendFromContext;
};

/**
 * Wraps component into a BackendContext consumer - injecting an instance of backend from context into the
 * backend prop.
 *
 * @internal
 */
export function withBackend<T extends { backend?: IAnalyticalBackend }>(
    Component: React.ComponentType<T>,
): React.ComponentType<T> {
    const ComponentWithInjectedBackend: React.FC<T> = (props) => {
        return (
            <BackendContext.Consumer>
                {(backend) => <Component {...props} backend={props.backend ?? backend} />}
            </BackendContext.Consumer>
        );
    };

    return wrapDisplayName("withBackend", Component)(ComponentWithInjectedBackend);
}
