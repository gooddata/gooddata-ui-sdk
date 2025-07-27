// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";

import { IDashboardRichTextMenuProps } from "../types.js";
import { DashboardRichTextMenu } from "./DashboardRichTextMenu/index.js";

/**
 * @alpha
 */
export function DefaultDashboardRichTextMenu(props: IDashboardRichTextMenuProps): ReactElement {
    return <DashboardRichTextMenu {...props} />;
}
