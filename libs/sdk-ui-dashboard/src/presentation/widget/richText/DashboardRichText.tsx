// (C) 2020-2024 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardRichTextProps } from "./types.js";

/**
 * @internal
 */
export const DashboardRichText = (props: IDashboardRichTextProps): JSX.Element => {
    const { widget } = props;
    const { RichTextWidgetComponentSet } = useDashboardComponentsContext();
    const RichTextComponent = useMemo(
        () => RichTextWidgetComponentSet.MainComponentProvider(widget),
        [RichTextWidgetComponentSet, widget],
    );

    return <RichTextComponent {...props} />;
};
