// (C) 2022 GoodData Corporation
import { type DateFilterComponentSet } from "../../componentDefinition/index.js";
import { type DateFilterComponentProvider } from "../../dashboardContexts/index.js";
import { DefaultDateFilterDraggingComponent } from "../../dragAndDrop/index.js";
import { AttributesDropdown } from "../attributeFilter/addAttributeFilter/index.js";
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
