// (C) 2024 GoodData Corporation

import * as React from "react";

const metadataTimezoneContext = React.createContext<string | undefined>(undefined);

/**
 * Provider for the timezone context.
 * @internal
 */
export const MetadataTimezoneProvider = metadataTimezoneContext.Provider;

/**
 * Hook for accessing the timezone from the context.
 * @internal
 */
export const useMetadataTimezone = () => React.useContext(metadataTimezoneContext);
