// (C) 2021-2025 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import { IDashboardRichTextMenuTitleProps } from "../types.js";

/**
 * @internal
 */
export function DefaultDashboardRichTextMenuTitle(_props: IDashboardRichTextMenuTitleProps) {
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
}
