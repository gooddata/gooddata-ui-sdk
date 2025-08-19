// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { IDashboardRichTextProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardRichText = (props: IDashboardRichTextProps): ReactElement => {
    const { widget } = props;
    const { RichTextWidgetComponentSet } = useDashboardComponentsContext();
    const RichTextComponent = useMemo(
        () => RichTextWidgetComponentSet.MainComponentProvider(widget),
        [RichTextWidgetComponentSet, widget],
    );

    return <RichTextComponent {...props} />;
};
