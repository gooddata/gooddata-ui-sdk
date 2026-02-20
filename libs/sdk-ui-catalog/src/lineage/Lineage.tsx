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
import {
    type IUiListboxItem,
    UiButton,
    UiDropdown,
    UiIconButton,
    UiListbox,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { HIDDEN_ITEMS, LEAF_TYPES } from "./const.js";
import { useLineageGraph } from "./useLineageGraph.js";
import { type ICatalogItem, type ICatalogItemRef } from "../catalogItem/types.js";

const messages = defineMessages({
    up: { id: "analyticsCatalog.lineage.direction.up" },
    down: { id: "analyticsCatalog.lineage.direction.down" },
});

type Props = {
    item: ICatalogItem;
    onItemClick?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

export function Lineage({ item, onItemClick }: Props) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const intl = useIntl();
    const [direction, setDirection] = useState<"up" | "down">("down");

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

    const items = useMemo(() => {
        return [
            {
                type: "interactive",
                id: "up",
                stringTitle: intl.formatMessage(messages["up"]),
            },
            {
                type: "interactive",
                id: "down",
                stringTitle: intl.formatMessage(messages["down"]),
            },
        ] as IUiListboxItem<unknown>[];
    }, [intl]);

    const isLoading = status === "loading" || status === "pending";
    const isLoadingOrSuccess = isLoading || status === "success";

    return (
        <div className="lineage-container" ref={ref}>
            {isLoadingOrSuccess ? (
                <>
                    <div className="lineage-direction">
                        <UiDropdown
                            closeOnEscape
                            autofocusOnOpen
                            closeOnOutsideClick
                            renderButton={(props) => (
                                <UiButton
                                    size="medium"
                                    isDisabled={isLoading}
                                    label={intl.formatMessage(messages[direction])}
                                    iconAfter={props.isOpen ? "chevronUp" : "chevronDown"}
                                    iconAfterSize={11}
                                    onClick={props.toggleDropdown}
                                />
                            )}
                            renderBody={(props) => (
                                <UiListbox
                                    width={200}
                                    items={items}
                                    ariaAttributes={{
                                        id: props.ariaAttributes.id,
                                    }}
                                    selectedItemId={direction}
                                    onSelect={(item) => {
                                        setDirection(item.id as "up" | "down");
                                        props.closeDropdown();
                                    }}
                                />
                            )}
                        />
                    </div>
                    <div className="lineage-toolbar">
                        <UiIconButton icon="minimize" onClick={reset} isDisabled={isLoading} />
                        <UiIconButton icon="expand" onClick={expand} isDisabled={isLoading} />
                        <div className="lineage-toolbar-spacer" />
                        <UiIconButton
                            icon="minusCircle"
                            onClick={zoomOut}
                            isDisabled={!zoomOutEnabled || isLoading}
                        />
                        <UiIconButton
                            icon="plusCircle"
                            onClick={zoomIn}
                            isDisabled={!zoomInEnabled || isLoading}
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
