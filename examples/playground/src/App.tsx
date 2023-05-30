// (C) 2019-2023 GoodData Corporation
import React, { useMemo } from "react";
import { BackendProvider, WorkspaceProvider, IntlWrapper } from "@gooddata/sdk-ui";
import { createBackend } from "./createBackend";

import { ControlledPivot } from './playground/ControlledPivot';
import { ControlledTransposedPivot } from './playground/ControlledTransposedPivot';

import "./playground/styles.scss";

function hasCredentialsSetup(): boolean {
    if (BACKEND_TYPE === "tiger") {
        return !!process.env.TIGER_API_TOKEN;
    }
    return BUILD_TYPE === "public" || (process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

const AppWithBackend: React.FC = () => {
    // only create the backend instance once
    const backend = useMemo(() => {
        return createBackend();
    }, []);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <IntlWrapper locale={"en-US"}>
                    <h1>Transposing</h1>
                    <ControlledTransposedPivot />
                    <h1>Pivoting</h1>
                    <ControlledPivot />
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
};

export const App: React.FC = () => {
    if (!hasCredentialsSetup()) {
        return (
            <p>
                Your playground is not setup with credentials. Check out the README.md for more. TL;DR: point
                the playground against the public access proxy or set GDC_USERNAME and GDC_PASSWORD or
                TIGER_API_TOKEN in the .env file.
            </p>
        );
    }

    return <AppWithBackend />;
};
