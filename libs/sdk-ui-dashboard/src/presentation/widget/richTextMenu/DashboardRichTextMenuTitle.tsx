// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardRichTextMenuTitleProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardRichTextMenuTitle(props: IDashboardRichTextMenuTitleProps): ReactElement {
    const { widget } = props;
    const { RichTextMenuTitleComponentProvider } = useDashboardComponentsContext();
    const RichTextMenuTitleComponent = useMemo(
        () => RichTextMenuTitleComponentProvider(widget),
        [RichTextMenuTitleComponentProvider, widget],
    );

    return <RichTextMenuTitleComponent {...props} />;
}
