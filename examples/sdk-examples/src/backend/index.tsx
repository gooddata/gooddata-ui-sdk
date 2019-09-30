import React, { createContext, useContext } from 'react';

import bearFactory from '@gooddata/sdk-backend-bear';

const username = process.env.GD_USERNAME;
const password = process.env.GD_PASSWORD;

export const backend = bearFactory().withCredentials(username, password);

export const BackendContext = createContext(bearFactory());

export const BackendProvider = ({ children }) => {
    return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
};

export const useBackend = () => useContext(BackendContext);
