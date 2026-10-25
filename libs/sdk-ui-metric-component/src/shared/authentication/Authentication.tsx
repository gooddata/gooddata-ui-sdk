// (C) 2021-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useEffect, useState } from "react";

import { type AnalyticalBackendError, ContractExpired, NotAuthenticated } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { GlobalLoading } from "../GlobalLoading/GlobalLoading.js";

/**
 * @internal
 */
export function Authentication({
    children,
    Error,
    initOpenNotAuthenticatedOverlay,
    initOpenContractExpiredDialog,
}: {
    Error: (err: Error) => ReactElement;
    initOpenNotAuthenticatedOverlay?: ((callback: (err: Error) => void) => void) | false;
    initOpenContractExpiredDialog?: ((callback: (tier: string) => void) => void) | false;
    children: ReactNode;
}) {
    const backend = useBackendStrict();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | AnalyticalBackendError | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        backend
            .authenticate()
            .then(() => {
                setLoading(false);
                setIsAuthenticated(true);
            })
            .catch((err) => handleError(err, setError));
    }, [backend]);

    useEffect(() => {
        // Register action for handling not authenticated responses (401) on UI from Tiger backend.
        // If the app is not ready, not authenticated responses will cause a direct redirect to login screen.
        // After registering, this action will be called on every not authenticated response instead
        // of the direct redirect.
        if (initOpenNotAuthenticatedOverlay && isAuthenticated) {
            initOpenNotAuthenticatedOverlay((err) => setError(err));
        }

        // Register action for handling ContractExpired responses on UI from Tiger backend.
        if (initOpenContractExpiredDialog) {
            initOpenContractExpiredDialog((tier) => {
                setError(new ContractExpired(tier));
            });
        }
    }, [isAuthenticated, initOpenNotAuthenticatedOverlay, initOpenContractExpiredDialog]);

    if (error) {
        return Error(error);
    }
    if (loading) {
        return <GlobalLoading />;
    }
    return <>{children}</>;
}

function handleError(
    err: Error | AnalyticalBackendError,
    setError: (err: Error | AnalyticalBackendError) => void,
) {
    //NOTE: Authenticate error makes redirect to login page
    if (err instanceof NotAuthenticated) {
        return;
    }

    console.error(err);
    setError(err);
}
