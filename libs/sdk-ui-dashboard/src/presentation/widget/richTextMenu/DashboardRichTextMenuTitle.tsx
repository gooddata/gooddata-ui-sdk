// (C) 2020-2025 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardRichTextMenuTitleProps } from "./types.js";

/**
 * @internal
 */
export const DashboardRichTextMenuTitle = (props: IDashboardRichTextMenuTitleProps): JSX.Element => {
    const { widget } = props;
    const { RichTextMenuTitleComponentProvider } = useDashboardComponentsContext();
    const RichTextMenuTitleComponent = useMemo(
        () => RichTextMenuTitleComponentProvider(widget),
        [RichTextMenuTitleComponentProvider, widget],
    );

    return <RichTextMenuTitleComponent {...props} />;
};
