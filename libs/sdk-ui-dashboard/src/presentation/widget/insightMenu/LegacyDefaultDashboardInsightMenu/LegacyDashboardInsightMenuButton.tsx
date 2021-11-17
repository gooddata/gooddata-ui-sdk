// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuButtonProps } from "../types";
import { LegacyInsightMenuButton } from "./LegacyInsightMenu/LegacyInsightMenuButton";

/**
 * @internal
 */
export const LegacyDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    return <LegacyInsightMenuButton {...props} />;
};
