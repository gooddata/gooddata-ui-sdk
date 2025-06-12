// (C) 2022 GoodData Corporation
import React from "react";

import { AuthProvider } from "./Auth";

export const AppProviders: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>;
};
