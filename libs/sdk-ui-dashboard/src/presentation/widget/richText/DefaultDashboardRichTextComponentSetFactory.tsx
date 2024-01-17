// (C) 2022-2024 GoodData Corporation
import React from "react";
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
            // TODO: RICH TEXT do we need to provide a placeholder at all? there is no "before" step (selecting measure for kpi, df for attribute or creating insight), you see the widget immediately
            CreatingPlaceholderComponent: DefaultDashboardRichTextPlaceholderWidget,
            CreatePanelListItemComponent: CreatableRichText,
            type: "richText-placeholder",
            priority: 5,
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}

const DefaultDashboardRichTextPlaceholderWidget = () => {
    return <div>Rich text placeholder</div>;
};
