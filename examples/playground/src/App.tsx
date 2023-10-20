// (C) 2019-2023 GoodData Corporation
import React, { useMemo, useState } from "react";
import { BackendProvider, WorkspaceProvider, IntlWrapper } from "@gooddata/sdk-ui";
import { UserEditDialog } from "@gooddata/sdk-ui-kit";

import { createBackend } from "./createBackend.js";

function hasCredentialsSetup(): boolean {
    if (BACKEND_TYPE === "tiger") {
        return !!process.env.TIGER_API_TOKEN;
    }
    return BUILD_TYPE === "public" || (process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

const AppWithBackend: React.FC = () => {
    // only create the backend instance once
    const { backend, tigerSpecificFunctions } = useMemo(() => {
        return createBackend();
    }, []);

    const [isOpen, setIsOpen] = useState(true);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <IntlWrapper locale="en-US">
                    {isOpen && (
                        <UserEditDialog
                            userId="mort"
                            onClose={() => setIsOpen(false)}
                            api={tigerSpecificFunctions!}
                        />
                    )}
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
