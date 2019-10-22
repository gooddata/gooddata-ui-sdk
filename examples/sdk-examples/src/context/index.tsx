// (C) 2019 GoodData Corporation
import React from "react";
import { AuthProvider } from "./auth";

export const AppProviders: React.FC = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>;
};
