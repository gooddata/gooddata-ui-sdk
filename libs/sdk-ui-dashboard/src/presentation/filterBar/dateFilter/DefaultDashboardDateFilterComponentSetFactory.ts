// (C) 2022-2026 GoodData Corporation

import { type DateFilterComponentSet } from "../../componentDefinition/types.js";
import { type DateFilterComponentProvider } from "../../dashboardContexts/types.js";
import { DefaultDateFilterDraggingComponent } from "../../dragAndDrop/draggableDateFilter/DefaultDateFilterDraggingComponent.js";
import { AttributesDropdown } from "../attributeFilter/addAttributeFilter/AttributesDropdown.js";
import { CreatableAttributeFilter } from "../attributeFilter/CreatableAttributeFilter.js";

/**
 * @internal
 */
export function DefaultDashboardDateFilterComponentSetFactory(
    dateFilterProvider: DateFilterComponentProvider,
): DateFilterComponentSet {
    return {
        MainComponentProvider: dateFilterProvider,
        creating: {
            CreatingPlaceholderComponent: AttributesDropdown,
            CreatePanelListItemComponent: CreatableAttributeFilter,
            type: "attributeFilter-placeholder",
            priority: 10,
        },
        dragging: {
            DraggingComponent: DefaultDateFilterDraggingComponent,
            type: "dateFilter",
        },
    };
}
