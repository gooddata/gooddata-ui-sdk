// (C) 2026 GoodData Corporation

import { type ComponentProps, useCallback, useEffect, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType } from "@gooddata/sdk-model";
import {
    FooterButtonAiAssistant,
    type ISearchMetrics,
    type SearchOnSelect,
    SearchOverlay,
    useSearchMetrics,
} from "@gooddata/sdk-ui-semantic-search/internal";

const RESULTS_LIMIT = 10;

/**
 * Telemetry callback emitted by host-runtime SemanticSearch.
 */
export type SemanticSearchEvent = { name: "search.performed"; payload: ISearchMetrics };

export interface ISemanticSearchProps {
    backend: IAnalyticalBackend;
    workspaceId: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    metadataTimeZone?: string;
    isTrial?: boolean;
    enableUseGenAIChat?: boolean;
    useHostedAnalyticalDesigner?: boolean;
    useHostedDashboards?: boolean;
    onAskAiAssistant?: (question: string) => void;
    onEvent?: (event: SemanticSearchEvent) => void;
}

export function SemanticSearch({
    backend,
    workspaceId,
    metadataTimeZone,
    canManage = false,
    canAnalyze = false,
    canFullControl = false,
    isTrial = false,
    enableUseGenAIChat = false,
    useHostedAnalyticalDesigner = false,
    useHostedDashboards = false,
    onAskAiAssistant,
    onEvent,
}: ISemanticSearchProps) {
    const intl = useIntl();

    const objectTypes = useMemo<GenAIObjectType[]>(() => {
        const types: GenAIObjectType[] = ["dashboard", "visualization"];

        if (canManage) {
            types.push("metric");
        }

        return types;
    }, [canManage]);

    const reportSearchMetrics = useCallback(
        (metrics: ISearchMetrics) => {
            const data: ISearchMetrics = { ...metrics };

            if (!isTrial) {
                // Strip sensitive info for non-trial org
                data.lastSearchTerm = "";
                data.selectedItemTitle = typeof data.selectedItemTitle === "string" ? "" : null;
            }

            onEvent?.({ name: "search.performed", payload: data });
        },
        [isTrial, onEvent],
    );
    const { onCloseMetrics, onSearchMetrics, onSelectMetrics } = useSearchMetrics(reportSearchMetrics);

    const onSelect = (selection: SearchOnSelect) => {
        onSelectMetrics(selection.item, selection.index);
    };

    // When the dialog is closing, this component gets unmounted.
    // Keeping behaviour identical to standalone Header.
    useEffect(() => {
        return () => {
            onCloseMetrics();
        };
    }, [onCloseMetrics]);

    const renderFooter: NonNullable<ComponentProps<typeof SearchOverlay>["renderFooter"]> = (
        props,
        { closeSearch },
    ) => {
        if (props.status !== "success" || !enableUseGenAIChat) {
            return null;
        }
        return (
            <FooterButtonAiAssistant
                onClick={() => {
                    closeSearch();
                    onAskAiAssistant?.(
                        intl.formatMessage({ id: "gen-ai.ask-assistant.search" }, { question: props.value }),
                    );
                }}
            />
        );
    };

    return (
        <SearchOverlay
            limit={RESULTS_LIMIT}
            locale={intl.locale}
            onSelect={onSelect}
            onSearch={onSearchMetrics}
            deepSearch={false}
            objectTypes={objectTypes}
            workspace={workspaceId}
            backend={backend}
            canManage={canManage}
            canAnalyze={canAnalyze}
            canFullControl={canFullControl}
            metadataTimezone={metadataTimeZone}
            uiPathOptions={{
                useHostedMetricEditor: true,
                useHostedAnalyticalDesigner,
                useHostedLdmModeler: true,
                useHostedDashboards,
            }}
            renderFooter={renderFooter}
        />
    );
}
