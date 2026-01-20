// (C) 2022-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    AnalyticalBackendErrorTypes,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";
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

export function PermissionsProvider({ children }: PropsWithChildren) {
    const workspace = useWorkspaceStrict();
    const intl = useIntl();
    const { result, loading, error } = useWorkspacePermissions(workspace);
    const value = useMemo(() => ({ permissions: result, loading }), [loading, result]);

    if (isUnexpectedResponseError(error)) {
        const traceId = (error.responseBody as any)?.traceId;
        return <GlobalError errorDetails={error.message} errorTraceId={error.traceId ?? traceId} />;
    }
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
}
