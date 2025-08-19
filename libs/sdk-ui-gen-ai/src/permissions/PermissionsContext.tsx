// (C) 2022-2025 GoodData Corporation
import React, { createContext, useMemo } from "react";

import { useIntl } from "react-intl";

import { AnalyticalBackendErrorTypes, isAnalyticalBackendError } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { emptyWorkspacePermissions } from "./utils.js";
import { GlobalError } from "../components/GlobalError.js";

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
    const value = useMemo(() => ({ permissions: result, loading }), [loading, result]);

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

    return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
