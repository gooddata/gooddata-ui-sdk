// (C) 2026 GoodData Corporation

import { ParameterControlButton } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import {
    displayOverride,
    matchingWorkspaceDefinition,
    resolveParameterTitle,
} from "../../../model/store/tabs/parameters/parametersHelpers.js";
import { selectDashboardParameterEntryByRef } from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { type ParameterDraggableItem } from "../types.js";

/**
 * @internal
 */
export interface IParameterDraggingComponentProps {
    itemType: "parameter";
    item: ParameterDraggableItem;
}

/**
 * Renders the floating preview of a parameter chip while it is being dragged.
 *
 * @internal
 */
export function DefaultParameterDraggingComponent({ item }: IParameterDraggingComponentProps) {
    const entry = useDashboardSelector(selectDashboardParameterEntryByRef(item.ref));
    const workspaceParameter = useDashboardSelector(selectCatalogParameterByRef(item.ref));

    if (!entry) {
        return null;
    }

    const displayValue = displayOverride(entry);
    const definition = matchingWorkspaceDefinition(entry.parameter, workspaceParameter);
    if (displayValue === undefined || !workspaceParameter || !definition) {
        return null;
    }

    const name = resolveParameterTitle(entry.parameter, workspaceParameter);
    return (
        <ParameterControlButton
            name={name}
            definition={definition}
            value={displayValue}
            isActive={false}
            isDraggable
            isDragging
        />
    );
}
