// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { type IDashboardRichTextProps } from "./types.js";

/**
 * @internal
 */
export function DashboardRichText(props: IDashboardRichTextProps): ReactElement {
    const { widget } = props;
    const { RichTextWidgetComponentSet } = useDashboardComponentsContext();
    const RichTextComponent = useMemo(
        () => RichTextWidgetComponentSet.MainComponentProvider(widget),
        [RichTextWidgetComponentSet, widget],
    );

    return <RichTextComponent {...props} />;
}
