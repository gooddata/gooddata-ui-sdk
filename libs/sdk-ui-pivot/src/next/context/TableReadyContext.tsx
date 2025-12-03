// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useCallback, useContext, useRef } from "react";

import { usePivotTableProps } from "./PivotTablePropsContext.js";

interface ITableReadyContext {
    /**
     * Call when AG Grid fires onFirstDataRendered.
     * Will trigger afterRender if visibility is also ready.
     */
    onFirstDataRendered: () => void;
    /**
     * Call when visibility becomes ready (resize calculations complete).
     * Will trigger afterRender if first data is also rendered.
     */
    onVisibilityReady: () => void;
}

const TableReadyContext = createContext<ITableReadyContext | undefined>(undefined);

/**
 * @internal
 */
export interface ITableReadyProviderProps {
    children: ReactNode;
}

/**
 * Provider that coordinates afterRender timing.
 * Calls afterRender when BOTH conditions are met:
 * - AG Grid has rendered first data (onFirstDataRendered)
 * - Visibility is ready (onVisibilityReady)
 *
 * Uses refs to avoid state/effect anti-patterns.
 *
 * @internal
 */
export function TableReadyProvider({ children }: ITableReadyProviderProps) {
    const { afterRender, execution } = usePivotTableProps();

    const firstDataRenderedRef = useRef(false);
    const visibilityReadyRef = useRef(false);
    const afterRenderCalledRef = useRef(false);
    const lastExecutionFingerprintRef = useRef<string | null>(null);

    // Check if execution changed and reset refs
    const currentFingerprint = execution.fingerprint();
    if (lastExecutionFingerprintRef.current !== currentFingerprint) {
        lastExecutionFingerprintRef.current = currentFingerprint;
        firstDataRenderedRef.current = false;
        visibilityReadyRef.current = false;
        afterRenderCalledRef.current = false;
    }

    const tryCallAfterRender = useCallback(() => {
        if (
            firstDataRenderedRef.current &&
            visibilityReadyRef.current &&
            !afterRenderCalledRef.current &&
            afterRender
        ) {
            afterRenderCalledRef.current = true;
            afterRender();
        }
    }, [afterRender]);

    const onFirstDataRendered = useCallback(() => {
        firstDataRenderedRef.current = true;
        tryCallAfterRender();
    }, [tryCallAfterRender]);

    const onVisibilityReady = useCallback(() => {
        visibilityReadyRef.current = true;
        tryCallAfterRender();
    }, [tryCallAfterRender]);

    return (
        <TableReadyContext.Provider value={{ onFirstDataRendered, onVisibilityReady }}>
            {children}
        </TableReadyContext.Provider>
    );
}

/**
 * @internal
 */
export function useTableReady(): ITableReadyContext {
    const context = useContext(TableReadyContext);
    if (!context) {
        throw new Error("useTableReady must be used within TableReadyProvider");
    }
    return context;
}
