// (C) 2022-2026 GoodData Corporation

import { AttributesDropdown } from "./addAttributeFilter/AttributesDropdown.js";
import { CreatableAttributeFilter } from "./CreatableAttributeFilter.js";
import { type AttributeFilterComponentSet } from "../../componentDefinition/types.js";
import { type AttributeFilterComponentProvider } from "../../dashboardContexts/types.js";
import { DefaultAttributeFilterDraggingComponent } from "../../dragAndDrop/draggableAttributeFilter/DefaultAttributeFilterDraggingComponent.js";

/**
 * @internal
 */
export function DefaultDashboardAttributeFilterComponentSetFactory(
    attributeFilterProvider: AttributeFilterComponentProvider,
): AttributeFilterComponentSet {
    return {
        MainComponentProvider: attributeFilterProvider,
        creating: {
            CreatingPlaceholderComponent: AttributesDropdown,
            CreatePanelListItemComponent: CreatableAttributeFilter,
            type: "attributeFilter-placeholder",
            priority: 3,
        },
        dragging: {
            DraggingComponent: DefaultAttributeFilterDraggingComponent,
            type: "attributeFilter",
        },
    };
}
