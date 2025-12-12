// (C) 2020-2025 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardRichTextProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

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
