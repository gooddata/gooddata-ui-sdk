// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardRichTextMenuProps } from "../types.js";
import { DashboardRichTextMenu } from "./DashboardRichTextMenu/index.js";

/**
 * @alpha
 */
export const DefaultDashboardRichTextMenu = (props: IDashboardRichTextMenuProps): ReactElement => {
    return <DashboardRichTextMenu {...props} />;
};
