// (C) 2022-2025 GoodData Corporation
import { AttributesDropdown } from "./addAttributeFilter/index.js";
import { CreatableAttributeFilter } from "./CreatableAttributeFilter.js";
import { type AttributeFilterComponentSet } from "../../componentDefinition/index.js";
import { type AttributeFilterComponentProvider } from "../../dashboardContexts/index.js";
import { DefaultAttributeFilterDraggingComponent } from "../../dragAndDrop/index.js";

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
