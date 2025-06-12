// (C) 2022-2025 GoodData Corporation
import { AnalyticalBackendErrorTypes, isAnalyticalBackendError } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import React, { createContext } from "react";

import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { emptyWorkspacePermissions } from "./utils.js";
import { GlobalError } from "../components/GlobalError.js";
import { useIntl } from "react-intl";

export const PermissionsContext = createContext<{
    loading: boolean;
    permissions: Partial<IWorkspacePermissions>;
}>({
    loading: true,
    permissions: emptyWorkspacePermissions(),
});

export const PermissionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const workspace = useWorkspaceStrict();
    const intl = useIntl();
    const { result, loading, error } = useWorkspacePermissions(workspace);

    if (isAnalyticalBackendError(error) && error.abeType === AnalyticalBackendErrorTypes.UNEXPECTED) {
        return <GlobalError errorDetails={error.message} />;
    }

    if (!result.canUseAiAssistant && !loading) {
        return (
            <GlobalError
                errorMessage={intl.formatMessage({ id: "gd.gen-ai.permission-error" })}
                errorDescription={intl.formatMessage({ id: "gd.gen-ai.permission-error.description" })}
            />
        );
    }

    return (
        <PermissionsContext.Provider value={{ permissions: result, loading }}>
            {children}
        </PermissionsContext.Provider>
    );
};
