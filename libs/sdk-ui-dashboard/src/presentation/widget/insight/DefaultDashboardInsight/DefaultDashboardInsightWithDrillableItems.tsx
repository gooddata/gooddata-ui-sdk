// (C) 2020 GoodData Corporation
import React from "react";

import { useDrill } from "../../../drill";
import { IDashboardInsightProps } from "../types";

import { DashboardInsightCore } from "./DashboardInsightCore";

/**
 * @internal
 */
export const DefaultDashboardInsightWithDrillableItems = (props: IDashboardInsightProps): JSX.Element => {
    const { run: onDrill } = useDrill();

    return <DashboardInsightCore {...props} onDrill={onDrill} />;
};
