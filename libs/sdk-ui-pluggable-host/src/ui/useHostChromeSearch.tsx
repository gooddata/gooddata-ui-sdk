// (C) 2026 GoodData Corporation

import { type ReactNode, useCallback } from "react";

import { type IPluggableAppTelemetryCallbacks } from "@gooddata/sdk-pluggable-application-model";

import { getBackend } from "../platformContext/backend.js";

import { SemanticSearch, type SemanticSearchEvent } from "./SemanticSearch.js";
import { type IHostChromeWorkspaceFeatures } from "./useHostChromeWorkspaceFeatures.js";

export interface IHostChromeSearch {
    /** The `<SemanticSearch>` element to mount in the header, or `null` when gated off. */
    element: ReactNode;
}

export interface IUseHostChromeSearchArgs {
    features: IHostChromeWorkspaceFeatures;
    isTrial: boolean;
    onAskAiAssistant: (question: string) => void;
    telemetry: IPluggableAppTelemetryCallbacks | undefined;
}

/**
 * Builds the semantic-search element rendered in the host chrome header.
 *
 * Forwards search events to the host telemetry callbacks and wires the AI-assistant
 * footer button so it can hand the user's question to the chat hook.
 */
export function useHostChromeSearch({
    features,
    isTrial,
    onAskAiAssistant,
    telemetry,
}: IUseHostChromeSearchArgs): IHostChromeSearch {
    const handleSearchEvent = useCallback(
        (event: SemanticSearchEvent) => {
            telemetry?.trackEvent(event.name, event.payload as unknown as Record<string, unknown>);
        },
        [telemetry],
    );

    const element: ReactNode =
        features.showSearch && features.workspaceId ? (
            <SemanticSearch
                backend={getBackend()}
                workspaceId={features.workspaceId}
                canManage={features.canManageProject}
                canAnalyze={features.canCreateVisualization}
                canFullControl={features.canFullControl}
                metadataTimeZone={features.settings.metadataTimeZone}
                isTrial={isTrial}
                enableUseGenAIChat={features.showChat}
                useHostedMetricEditor={Boolean(features.settings.enableShellApplication_metricEditor)}
                useHostedAnalyticalDesigner={Boolean(
                    features.settings.enableShellApplication_analyticalDesigner,
                )}
                useHostedLdmModeler={Boolean(features.settings.enableShellApplication_ldmModeler)}
                onAskAiAssistant={onAskAiAssistant}
                onEvent={handleSearchEvent}
            />
        ) : null;

    return { element };
}
