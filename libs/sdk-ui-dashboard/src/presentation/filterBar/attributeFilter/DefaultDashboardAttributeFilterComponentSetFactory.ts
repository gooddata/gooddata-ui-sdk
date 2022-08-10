// (C) 2022 GoodData Corporation
import { AttributeFilterComponentSet } from "../../componentDefinition";
import { AttributeFilterComponentProvider } from "../../dashboardContexts";
import { DefaultAttributeFilterDraggingComponent } from "../../dragAndDrop";
import { AttributesDropdown } from "./addAttributeFilter";
import { CreatableAttributeFilter } from "./CreatableAttributeFilter";

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
            CreatePanelItemComponent: CreatableAttributeFilter,
            type: "attributeFilter-placeholder",
            priority: 10,
        },
        dragging: {
            DraggingComponent: DefaultAttributeFilterDraggingComponent,
            type: "attributeFilter",
        },
    };
}
