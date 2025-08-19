// (C) 2024-2025 GoodData Corporation
import React, { useMemo } from "react";

import { IAnalyticalBackend, IRequestCorrelationMetadata } from "@gooddata/sdk-backend-spi";

import { BackendProvider, useBackend } from "./BackendContext.js";

/**
 * Context for storing request correlation metadata across components
 */
const CorrelationContext = React.createContext<IRequestCorrelationMetadata>({});
CorrelationContext.displayName = "CorrelationContext";

/**
 * Props of the {@link CorrelationProvider} component.
 * @public
 */
export interface ICorrelationProviderProps {
    /**
     * Key-value pairs of correlation metadata to be used for telemetry
     */
    correlationData: Record<string, string>;

    /**
     * React children
     */
    children?: React.ReactNode;
}

/**
 * CorrelationProvider provides request correlation metadata to components.
 * When nested, correlation metadata from ancestor providers is merged with the current provider.
 *
 * @public
 */
export const CorrelationProvider: React.FC<ICorrelationProviderProps> = ({ children, correlationData }) => {
    // Get parent correlation metadata to merge with
    const parentCorrelationData = useCorrelationData();

    const memoizedAdditionalCorrelationData = useMemo(() => {
        return correlationData;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(correlationData)]);

    // Merge parent data with our data (newer values override)
    const mergedData = useMemo(() => {
        return { ...parentCorrelationData, ...memoizedAdditionalCorrelationData };
    }, [parentCorrelationData, memoizedAdditionalCorrelationData]);

    return <CorrelationContext.Provider value={mergedData}>{children}</CorrelationContext.Provider>;
};

/**
 * Hook to get correlation metadata from the nearest correlation provider.
 *
 * @public
 */
export const useCorrelationData = (): Record<string, string> => {
    return React.useContext(CorrelationContext);
};

/**
 * Hook to get a backend instance with correlation metadata from context,
 * and optionally merge them with additional correlation metadata provided as a parameter.
 *
 * @remarks
 * This hook enhances the backend from useBackend() with correlation metadata
 * from the nearest CorrelationProvider.
 *
 * @param backend - optional backend override
 * @param correlationMetadata - optional correlation metadata to merge with the context data
 * @public
 */
export const useBackendWithCorrelation = (
    backend?: IAnalyticalBackend,
    correlationMetadata?: IRequestCorrelationMetadata,
): IAnalyticalBackend | undefined => {
    const contextBackend = useBackend();
    const effectiveBackend = backend ?? contextBackend;
    const correlationData = useCorrelationData();

    const memoizedAdditionalCorrelationData = useMemo(() => {
        return correlationMetadata;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(correlationMetadata)]);

    // Merge correlation data from context with metadata parameter, giving priority to context data
    const mergedCorrelationData = useMemo(() => {
        return { ...correlationData, ...memoizedAdditionalCorrelationData };
    }, [correlationData, memoizedAdditionalCorrelationData]);

    return useMemo(() => {
        if (!effectiveBackend || Object.keys(mergedCorrelationData).length === 0) {
            return effectiveBackend;
        }
        return effectiveBackend.withCorrelation(mergedCorrelationData);
    }, [effectiveBackend, mergedCorrelationData]);
};

/**
 * Combined provider for both backend and correlation metadata.
 *
 * @public
 */
export interface IBackendProviderWithCorrelationProps {
    /**
     * Backend instance to use or enhance with correlation
     */
    backend?: IAnalyticalBackend;

    /**
     * Key-value pairs of correlation metadata to be used for telemetry
     */
    correlationData: IRequestCorrelationMetadata;

    /**
     * React children
     */
    children?: React.ReactNode;
}

/**
 * Combined provider for both backend and correlation metadata.
 * This is a convenience component that wraps BackendProvider and CorrelationProvider
 * to provide both a backend instance and correlation metadata to components.
 *
 * @public
 */
export const BackendProviderWithCorrelation: React.FC<IBackendProviderWithCorrelationProps> = ({
    backend: externalBackend,
    correlationData,
    children,
}) => {
    // Get existing backend from context if not provided
    const contextBackend = useBackend();
    const baseBackend = externalBackend || contextBackend;

    // Get parent correlation metadata and merge
    const parentCorrelationData = useCorrelationData();

    const memoizedAdditionalCorrelationData = useMemo(() => {
        return correlationData;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(correlationData)]);

    const mergedData = useMemo(() => {
        return { ...parentCorrelationData, ...memoizedAdditionalCorrelationData };
    }, [parentCorrelationData, memoizedAdditionalCorrelationData]);

    // Create enhanced backend with correlation metadata
    const enhancedBackend = useMemo(() => {
        if (!baseBackend) {
            return baseBackend;
        }
        return baseBackend.withCorrelation(mergedData);
    }, [baseBackend, mergedData]);

    // If we have no backend at all, just provide the correlation metadata
    if (!baseBackend) {
        return <CorrelationProvider correlationData={correlationData}>{children}</CorrelationProvider>;
    }

    // Otherwise provide both enhanced backend and correlation metadata
    return (
        <CorrelationContext.Provider value={mergedData}>
            {enhancedBackend ? <BackendProvider backend={enhancedBackend}>{children}</BackendProvider> : null}
        </CorrelationContext.Provider>
    );
};
