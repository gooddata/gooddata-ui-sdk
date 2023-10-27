// (C) 2019-2023 GoodData Corporation
import React, { useMemo, useState } from "react";
import { BackendProvider, WorkspaceProvider, IntlWrapper } from "@gooddata/sdk-ui";
import { UserEditDialog, UserGroupEditDialog, CreateUserGroupDialog } from "@gooddata/sdk-ui-kit";

import { createBackend } from "./createBackend.js";

function hasCredentialsSetup(): boolean {
    if (BACKEND_TYPE === "tiger") {
        return !!process.env.TIGER_API_TOKEN;
    }
    return BUILD_TYPE === "public" || (process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

const AppWithBackend: React.FC = () => {
    // only create the backend instance once
    const { backend } = useMemo(() => {
        return createBackend();
    }, []);

    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isUserGroupOpen, setIsUserGroupOpen] = useState(false);
    const [isCreateUserGroupOpen, setIsCreateUserGroupOpen] = useState(true);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <IntlWrapper locale="en-US">
                    {isUserOpen ? (
                        <UserEditDialog
                            userId="ahsoka.tano"
                            organizationId="mlkse3rji6"
                            isAdmin={false}
                            onClose={() => setIsUserOpen(false)}
                        />
                    ) : undefined}
                    {isUserGroupOpen ? (
                        <UserGroupEditDialog
                            userGroupId="viewerGroup"
                            organizationId="mlkse3rji6"
                            isAdmin={false}
                            onClose={() => setIsUserGroupOpen(false)}
                        />
                    ) : undefined}
                    {isCreateUserGroupOpen ? (
                        <CreateUserGroupDialog
                            organizationId="mlkse3rji6"
                            onCancel={() => setIsCreateUserGroupOpen(false)}
                        />
                    ) : undefined}
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
