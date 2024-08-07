// (C) 2024 GoodData Corporation

import * as React from "react";

const timezoneContext = React.createContext<string | undefined>(undefined);

export const TimezoneProvider = timezoneContext.Provider;
export const useTimezone = () => React.useContext(timezoneContext);
