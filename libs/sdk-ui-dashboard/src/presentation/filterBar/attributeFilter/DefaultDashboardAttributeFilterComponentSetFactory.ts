// (C) 2022-2024 GoodData Corporation
import { AttributeFilterComponentSet } from "../../componentDefinition/index.js";
import { AttributeFilterComponentProvider } from "../../dashboardContexts/index.js";
import { DefaultAttributeFilterDraggingComponent } from "../../dragAndDrop/index.js";
import { AttributesDropdown } from "./addAttributeFilter/index.js";
import { CreatableAttributeFilter } from "./CreatableAttributeFilter.js";

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
