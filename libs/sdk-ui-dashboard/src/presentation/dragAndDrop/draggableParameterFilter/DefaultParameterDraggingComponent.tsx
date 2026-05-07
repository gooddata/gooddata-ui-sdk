// (C) 2026 GoodData Corporation

import { ParameterControlButton } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import { selectDashboardParameterEntryByRef } from "../../../model/store/parameters/parametersSelectors.js";
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

    if (entry?.runtimeOverride === undefined) {
        return null;
    }

    const name = entry.parameter.label ?? workspaceParameter?.title ?? "";
    return (
        <ParameterControlButton
            name={name}
            value={entry.runtimeOverride}
            isActive={false}
            isDraggable
            isDragging
        />
    );
}
