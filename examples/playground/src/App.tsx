// (C) 2019-2025 GoodData Corporation

import { useMemo } from "react";

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { createBackend } from "./createBackend.js";
import { Playground } from "./playground/Playground.js";
import "./global.css"; // Import global styles

function hasCredentialsSetup(): boolean {
    return !!import.meta.env.VITE_TIGER_API_TOKEN;
}

function AppWithBackend() {
    // only create the backend instance once
    const backend = useMemo(() => {
        return createBackend();
    }, []);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={import.meta.env.VITE_WORKSPACE}>
                <Playground />
            </WorkspaceProvider>
        </BackendProvider>
    );
}

export function App() {
    if (!hasCredentialsSetup()) {
        return (
            <p>
                Your playground is not setup with credentials. Check out the README.md for more. TL;DR: point
                the playground against the public access proxy or set TIGER_API_TOKEN in the .env file.
            </p>
        );
    }

    return <AppWithBackend />;
}
