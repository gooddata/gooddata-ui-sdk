// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo, useRef, useState } from "react";

import { type ObjRefInScope, objRefToString } from "@gooddata/sdk-model";

import type { IDimensionalityItem } from "./typings.js";

interface IUseLazyCatalogDimensionalityParams {
    isOpen: boolean;
    dimensionality: IDimensionalityItem[];
    loadCatalogDimensionality?: (dimensionality: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
}

/**
 * Loads catalog dimensionality items lazily (typically when the attribute picker is opened).
 *
 * The loader depends on current filter dimensionality (for computeValidObjects-style availability).
 * To avoid redundant reloads, the hook keeps an order-insensitive key of the last loaded dimensionality.
 */
export function useLazyCatalogDimensionality({
    isOpen,
    dimensionality,
    loadCatalogDimensionality,
}: IUseLazyCatalogDimensionalityParams) {
    const [lazyCatalogDimensionality, setLazyCatalogDimensionality] = useState<
        IDimensionalityItem[] | undefined
    >(undefined);
    const [isLoadingLazyCatalogDimensionality, setIsLoadingLazyCatalogDimensionality] = useState(false);
    const lastLoadedKeyRef = useRef<string | undefined>(undefined);
    const inFlightRequestIdRef = useRef(0);

    const dimensionalityKey = useMemo(() => {
        // Use stable, order-insensitive key.
        return dimensionality
            .map((i) => objRefToString(i.identifier))
            .slice()
            .sort()
            .join("|");
    }, [dimensionality]);

    useEffect(() => {
        if (!isOpen || !loadCatalogDimensionality) {
            return;
        }

        // Avoid re-loading if we already have results for the same dimensionality.
        if (lastLoadedKeyRef.current === dimensionalityKey && lazyCatalogDimensionality) {
            return;
        }

        let cancelled = false;
        inFlightRequestIdRef.current += 1;
        const requestId = inFlightRequestIdRef.current;

        setIsLoadingLazyCatalogDimensionality(true);

        const run = async () => {
            try {
                const items = await loadCatalogDimensionality(dimensionality.map((i) => i.identifier));
                const isStale = cancelled || requestId !== inFlightRequestIdRef.current;
                if (isStale) {
                    return;
                }
                lastLoadedKeyRef.current = dimensionalityKey;
                setLazyCatalogDimensionality(items);
            } catch (e) {
                const isStale = cancelled || requestId !== inFlightRequestIdRef.current;
                if (isStale) {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error("Failed to load MVF catalog dimensionality:", e);
                lastLoadedKeyRef.current = dimensionalityKey;
                setLazyCatalogDimensionality([]);
            } finally {
                const isStale = cancelled || requestId !== inFlightRequestIdRef.current;
                if (!isStale) {
                    setIsLoadingLazyCatalogDimensionality(false);
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [isOpen, loadCatalogDimensionality, dimensionality, dimensionalityKey, lazyCatalogDimensionality]);

    return {
        lazyCatalogDimensionality,
        isLoadingLazyCatalogDimensionality,
    };
}
