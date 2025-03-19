// (C) 2021-2025 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import { CustomDashboardRichTextMenuTitleComponent } from "../types.js";

/**
 * @internal
 */
export const DefaultDashboardRichTextMenuTitle: CustomDashboardRichTextMenuTitleComponent = () => {
    const intl = useIntl();
    const title = intl.formatMessage({ id: "addPanel.richText" });

    return (
        <>
            <Typography tagName="h3" className="widget-title s-widget-title">
                <span title={title} className="insight-title s-insight-title s-insight-title-simple">
                    {title}
                </span>
            </Typography>
        </>
    );
};
