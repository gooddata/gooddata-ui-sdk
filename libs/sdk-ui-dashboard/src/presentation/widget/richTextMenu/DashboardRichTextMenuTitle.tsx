// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { IDashboardRichTextMenuTitleProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardRichTextMenuTitle = (props: IDashboardRichTextMenuTitleProps): ReactElement => {
    const { widget } = props;
    const { RichTextMenuTitleComponentProvider } = useDashboardComponentsContext();
    const RichTextMenuTitleComponent = useMemo(
        () => RichTextMenuTitleComponentProvider(widget),
        [RichTextMenuTitleComponentProvider, widget],
    );

    return <RichTextMenuTitleComponent {...props} />;
};
