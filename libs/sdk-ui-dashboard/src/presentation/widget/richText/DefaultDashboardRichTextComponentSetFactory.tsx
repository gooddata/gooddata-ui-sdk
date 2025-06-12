// (C) 2022-2024 GoodData Corporation
import { RichTextWidgetComponentSet } from "../../componentDefinition/index.js";
import { RichTextComponentProvider } from "../../dashboardContexts/index.js";
import { RichTextDraggingComponent } from "../../dragAndDrop/index.js";
import { CreatableRichText } from "./CreatableRichText.js";

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
