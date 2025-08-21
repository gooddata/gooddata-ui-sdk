// (C) 2022-2025 GoodData Corporation
import React from "react";

import { AuthProvider } from "./Auth";

export function AppProviders({ children }: { children?: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
