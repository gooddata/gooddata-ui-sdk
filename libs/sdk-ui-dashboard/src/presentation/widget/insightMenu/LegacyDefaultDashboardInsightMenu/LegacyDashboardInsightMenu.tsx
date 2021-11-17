// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuProps } from "../types";
import { LegacyInsightMenu } from "./LegacyInsightMenu";

/**
 * @internal
 */
export const LegacyDashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    return <LegacyInsightMenu {...props} />;
};
