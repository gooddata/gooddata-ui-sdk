// (C) 2019 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { wrapDisplayName } from "./wrapDisplayName";

/**
 * @internal
 */
const BackendContext = React.createContext<IAnalyticalBackend>(undefined);
BackendContext.displayName = "BackendContext";

/**
 * @internal
 */
interface IBackendProviderProps {
    backend: IAnalyticalBackend;
}

/**
 * BackendProvider can be used to inject analytical backend instance to all ui-sdk components in your app
 * @public
 */
export const BackendProvider: React.FC<IBackendProviderProps> = ({ children, backend }) => {
    return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
};

/**
 * Hook to get analytical backend instance provided to BackendProvider
 * @public
 */
export const useBackend = () => {
    const backend = React.useContext(BackendContext);
    return backend;
};

export function withBackend<T extends { backend?: IAnalyticalBackend }>(Chart: React.ComponentType<T>) {
    const ComponentWithInjectedBackend: React.FC<T> = props => {
        return (
            <BackendContext.Consumer>
                {backend => <Chart backend={backend} {...props} />}
            </BackendContext.Consumer>
        );
    };

    return wrapDisplayName("withBackend", Chart)(ComponentWithInjectedBackend);
}
