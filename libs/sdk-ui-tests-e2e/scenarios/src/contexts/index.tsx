// (C) 2022-2025 GoodData Corporation
import { ReactNode } from "react";

import { AuthProvider } from "./Auth";

export function AppProviders({ children }: { children?: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
