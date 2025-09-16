// (C) 2024-2025 GoodData Corporation

import { createContext, useContext } from "react";

const metadataTimezoneContext = createContext<string | undefined>(undefined);

/**
 * Provider for the timezone context.
 * @internal
 */
export const MetadataTimezoneProvider = metadataTimezoneContext.Provider;

/**
 * Hook for accessing the timezone from the context.
 * @internal
 */
export const useMetadataTimezone = () => useContext(metadataTimezoneContext);
