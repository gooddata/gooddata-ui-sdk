// (C) 2019 GoodData Corporation
import React, { createContext, useContext } from "react";
import bearFactory, { FixedLoginAndPasswordAuthProvider } from "@gooddata/sdk-backend-bear";
import { ENV_CREDENTIALS } from "../constants";

export const backend = bearFactory().withAuthentication(
    new FixedLoginAndPasswordAuthProvider(ENV_CREDENTIALS.username, ENV_CREDENTIALS.password),
);

export const BackendContext = createContext(bearFactory());

export const BackendProvider = ({ children }) => {
    return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
};

export const useBackend = () => useContext(BackendContext);
