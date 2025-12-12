// (C) 2022-2025 GoodData Corporation
import { CreatableRichText } from "./CreatableRichText.js";
import { type RichTextWidgetComponentSet } from "../../componentDefinition/index.js";
import { type RichTextComponentProvider } from "../../dashboardContexts/index.js";
import { RichTextDraggingComponent } from "../../dragAndDrop/index.js";

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
