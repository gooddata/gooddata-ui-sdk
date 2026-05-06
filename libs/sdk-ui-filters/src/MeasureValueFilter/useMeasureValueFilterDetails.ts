// (C) 2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

interface IUseMeasureValueFilterDetailsParams {
    isOpen: boolean;
    requestHandler?: () => Promise<IMeasureMetadataObject | undefined>;
}

/**
 * Manages async loading state for the MeasureValueFilter details bubble. Triggers a
 * single load when the bubble first opens and ignores stale results if the bubble
 * is reopened before the previous request resolves.
 *
 * @internal
 */
export function useMeasureValueFilterDetails({
    isOpen,
    requestHandler,
}: IUseMeasureValueFilterDetailsParams) {
    const [details, setDetails] = useState<IMeasureMetadataObject | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);
    const inFlightRequestIdRef = useRef(0);

    useEffect(() => {
        if (!isOpen || !requestHandler) {
            return;
        }

        let cancelled = false;
        inFlightRequestIdRef.current += 1;
        const requestId = inFlightRequestIdRef.current;

        setIsLoading(true);
        setError(undefined);

        const run = async () => {
            try {
                const result = await requestHandler();
                if (cancelled || requestId !== inFlightRequestIdRef.current) {
                    return;
                }
                setDetails(result);
            } catch (e) {
                if (cancelled || requestId !== inFlightRequestIdRef.current) {
                    return;
                }
                setError(e instanceof Error ? e : new Error(String(e)));
                setDetails(undefined);
            } finally {
                if (!cancelled && requestId === inFlightRequestIdRef.current) {
                    setIsLoading(false);
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [isOpen, requestHandler]);

    return { details, isLoading, error };
}
