// (C) 2022-2026 GoodData Corporation

import { CreatableRichText } from "./CreatableRichText.js";
import { type RichTextWidgetComponentSet } from "../../componentDefinition/types.js";
import { type RichTextComponentProvider } from "../../dashboardContexts/types.js";
import { RichTextDraggingComponent } from "../../dragAndDrop/draggableWidget/RichTextDraggingComponent.js";

/**
 * @internal
 */
export function DefaultDashboardRichTextComponentSetFactory(
    richTextProvider: RichTextComponentProvider,
): RichTextWidgetComponentSet {
    return {
        MainComponentProvider: richTextProvider,
        dragging: {
            DraggingComponent: RichTextDraggingComponent,
            type: "richText",
        },
        creating: {
            CreatePanelListItemComponent: CreatableRichText,
            type: "richTextListItem",
            priority: 5,
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
