// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardRichTextMenuProps } from "../types.js";

import { DashboardRichTextMenu } from "./DashboardRichTextMenu/index.js";

/**
 * @alpha
 */
export function DefaultDashboardRichTextMenu(props: IDashboardRichTextMenuProps): ReactElement {
    return <DashboardRichTextMenu {...props} />;
}
