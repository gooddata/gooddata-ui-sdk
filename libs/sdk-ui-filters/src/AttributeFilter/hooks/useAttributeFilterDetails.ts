// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type IAttributeElement, type ObjRef } from "@gooddata/sdk-model";

interface IUseAttributeFilterDetailsParams {
    /** Whether the bubble is open */
    isOpen: boolean;
    /** Display form ref used for loading elements */
    labelRef: ObjRef;
    /** Callback invoked when bubble opens; loads up to 5 sample elements */
    requestHandler: (labelRef: ObjRef) => Promise<{ elements: IAttributeElement[]; totalCount: number }>;
}

/**
 * Manages the async loading state for the AttributeFilter details bubble.
 * Loads sample elements when the bubble opens and cancels stale requests on close.
 *
 * @internal
 */
export function useAttributeFilterDetails({
    isOpen,
    labelRef,
    requestHandler,
}: IUseAttributeFilterDetailsParams) {
    const [elements, setElements] = useState<IAttributeElement[]>([]);
    const [totalCount, setTotalCount] = useState(0);
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
                const result = await requestHandler(labelRef);
                if (cancelled || requestId !== inFlightRequestIdRef.current) {
                    return;
                }
                setElements(result.elements);
                setTotalCount(result.totalCount);
            } catch (e) {
                if (cancelled || requestId !== inFlightRequestIdRef.current) {
                    return;
                }
                setError(e instanceof Error ? e : new Error(String(e)));
                setElements([]);
                setTotalCount(0);
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
    }, [isOpen, labelRef, requestHandler]);

    return {
        elements,
        totalCount,
        isLoading,
        error,
    };
}
