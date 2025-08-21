// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { DashboardRichTextMenu } from "./DashboardRichTextMenu/index.js";
import { IDashboardRichTextMenuProps } from "../types.js";

/**
 * @alpha
 */
export function DefaultDashboardRichTextMenu(props: IDashboardRichTextMenuProps): ReactElement {
    return <DashboardRichTextMenu {...props} />;
}
