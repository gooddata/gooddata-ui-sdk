// (C) 2024 GoodData Corporation

import * as React from "react";

const timezoneContext = React.createContext<string | undefined>(undefined);

/**
 * Provider for the timezone context.
 * @internal
 */
export const TimezoneProvider = timezoneContext.Provider;

/**
 * Hook for accessing the timezone from the context.
 * @internal
 */
export const useTimezone = () => React.useContext(timezoneContext);
