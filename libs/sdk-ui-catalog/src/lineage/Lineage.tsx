// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import {
    ErrorComponent,
    LoadingComponent,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { UiIconButton, UiTooltip, useElementSize } from "@gooddata/sdk-ui-kit";

import { HIDDEN_ITEMS, LEAF_TYPES } from "./const.js";
import { useLineageGraph } from "./useLineageGraph.js";
import { type ICatalogItem, type ICatalogItemRef } from "../catalogItem/types.js";

const messages = defineMessages({
    up: { id: "analyticsCatalog.lineage.direction.up" },
    down: { id: "analyticsCatalog.lineage.direction.down" },
    both: { id: "analyticsCatalog.lineage.direction.both" },
});

type Props = {
    item: ICatalogItem;
    onItemClick?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

export function Lineage({ item, onItemClick }: Props) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const intl = useIntl();
    const [direction, setDirection] = useState<"up" | "down" | "both">("down");

    const objRef = useMemo(() => ({ identifier: item.identifier, type: item.type }), [item]);

    const { result, status, error } = useCancelablePromise<IReferencesResult, Error>(
        {
            promise: () => {
                const refs = backend.workspace(workspace).references();
                return refs.getReferences(objRef, {
                    direction,
                });
            },
        },
        [objRef, direction],
    );

    const { ref, width, height } = useElementSize<HTMLDivElement>();
    const { setContainer, zoomIn, zoomOut, reset, expand, zoomOutEnabled, zoomInEnabled } = useLineageGraph(
        result?.nodes,
        result?.edges,
        {
            onItemClick,
            typesToFilter: HIDDEN_ITEMS,
            leafTypesToFilter: LEAF_TYPES,
            direction,
        },
    );

    const isLoading = status === "loading" || status === "pending";
    const isLoadingOrSuccess = isLoading || status === "success";

    return (
        <div className="lineage-container" ref={ref}>
            {isLoadingOrSuccess ? (
                <>
                    <div className="lineage-toolbar">
                        <UiTooltip
                            arrowPlacement="bottom"
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="tertiary"
                                    icon="stream"
                                    onClick={() => {
                                        setDirection("both");
                                    }}
                                    isActive={direction === "both"}
                                    isDisabled={isLoading}
                                />
                            }
                            content={intl.formatMessage(messages.both)}
                        />
                        <UiTooltip
                            arrowPlacement="bottom"
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="tertiary"
                                    icon="streamDown"
                                    onClick={() => {
                                        setDirection("down");
                                    }}
                                    isActive={direction === "down"}
                                    isDisabled={isLoading}
                                />
                            }
                            content={intl.formatMessage(messages.down)}
                        />
                        <UiTooltip
                            arrowPlacement="bottom"
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="tertiary"
                                    icon="streamUp"
                                    onClick={() => {
                                        setDirection("up");
                                    }}
                                    isActive={direction === "up"}
                                    isDisabled={isLoading}
                                />
                            }
                            content={intl.formatMessage(messages.up)}
                        />
                        <div className="lineage-toolbar-divider" />
                        <UiIconButton
                            size="small"
                            variant="tertiary"
                            icon="minus"
                            onClick={zoomOut}
                            isDisabled={!zoomOutEnabled || isLoading}
                        />
                        <UiIconButton
                            size="small"
                            variant="tertiary"
                            icon="plus"
                            onClick={zoomIn}
                            isDisabled={!zoomInEnabled || isLoading}
                        />
                        <div className="lineage-toolbar-divider" />
                        <UiIconButton
                            size="small"
                            variant="tertiary"
                            icon="minimize"
                            onClick={reset}
                            isDisabled={isLoading}
                        />
                        <UiIconButton
                            size="small"
                            variant="tertiary"
                            icon="expand"
                            onClick={expand}
                            isDisabled={isLoading}
                        />
                    </div>
                </>
            ) : null}
            {isLoading ? <LoadingComponent /> : null}
            {status === "success" ? (
                <div
                    className="lineage-container-graph"
                    ref={setContainer}
                    style={{
                        width,
                        height,
                    }}
                />
            ) : null}
            {status === "error" && error ? <ErrorComponent message={error.message} width="100%" /> : null}
        </div>
    );
}
