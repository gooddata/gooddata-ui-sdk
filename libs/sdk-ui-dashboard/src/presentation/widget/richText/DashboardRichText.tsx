// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardRichTextProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

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
