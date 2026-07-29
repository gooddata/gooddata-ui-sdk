// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo } from "react";

import type { IInsightDefinition } from "@gooddata/sdk-model";

import type { IAsCodeEditing } from "../asCode/descriptor.js";

/** @internal */
export type IInsightCodec = IAsCodeEditing<IInsightDefinition>;

/** @internal */
export type VisualizationTypePredicate = (visualizationType: string) => boolean;

type InsightCodecContextValue = {
    codec?: IInsightCodec;
    // Rejects when the build fails (tying the failure to the caller), dedupes concurrent calls, serves
    // an already-built codec without reload, and keeps a stable identity per workspace — it is a
    // downstream effect dependency, so a new identity re-issues the request.
    requestLoad: () => Promise<void>;
    // Static (workspace-independent), so it gates the inline-edit affordance before the codec loads.
    isVisualizationTypeEditable?: VisualizationTypePredicate;
};

const InsightCodecContext = createContext<InsightCodecContextValue | null>(null);

/** Injects the host-built visualization codec, keeping this package free of the Tiger-coupled convertors. @internal */
export function InsightCodecProvider({
    codec,
    requestLoad,
    isVisualizationTypeEditable,
    children,
}: PropsWithChildren<{
    codec?: IInsightCodec;
    requestLoad: () => Promise<void>;
    isVisualizationTypeEditable?: VisualizationTypePredicate;
}>) {
    const value = useMemo<InsightCodecContextValue>(
        () => ({ codec, requestLoad, isVisualizationTypeEditable }),
        [codec, requestLoad, isVisualizationTypeEditable],
    );
    return <InsightCodecContext.Provider value={value}>{children}</InsightCodecContext.Provider>;
}

/** Whether a host injected the codec machinery; entry points gate on this since without a host the codec never resolves. @internal */
export function useHasInsightCodecHost(): boolean {
    return useContext(InsightCodecContext) !== null;
}

/** The injected codec, or `null` while loading — a pure read; the load is driven by {@link useRequestInsightCodec}. @internal */
export function useInsightCodec(): IInsightCodec | null {
    return useContext(InsightCodecContext)?.codec ?? null;
}

// No host: a resolved no-op so the (gated-unreachable) request effect neither fetches nor crashes.
const noCodecHost = () => Promise.resolve();

/** The host's codec-load request lever (contract on {@link InsightCodecContextValue}). @internal */
export function useRequestInsightCodec(): () => Promise<void> {
    return useContext(InsightCodecContext)?.requestLoad ?? noCodecHost;
}

/** Per-chart-type editability from the host: false with no host, else its predicate (absent predicate ⇒ all editable). @internal */
export function useIsVisualizationTypeEditable(): VisualizationTypePredicate {
    const context = useContext(InsightCodecContext);
    const hasHost = context !== null;
    const isVisualizationTypeEditable = context?.isVisualizationTypeEditable;
    return useCallback(
        (visualizationType: string) => hasHost && (isVisualizationTypeEditable?.(visualizationType) ?? true),
        [hasHost, isVisualizationTypeEditable],
    );
}
