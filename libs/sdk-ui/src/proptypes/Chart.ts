// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";
import { ChartConfigPropType } from "./ChartConfig";
import { EventsPropTypes } from "./Events";
import { DataSourcePropType } from "./DataSource";
import { DrillableItemPropType, DrillablePredicatePropType } from "./DrillableItem";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const ChartPropTypes = {
    config: ChartConfigPropType,
    ...EventsPropTypes,
    dataSource: DataSourcePropType.isRequired,
    locale: PropTypes.string,
    height: PropTypes.number,
    drillableItems: PropTypes.arrayOf(
        PropTypes.oneOfType([DrillableItemPropType, DrillablePredicatePropType]),
    ),
    environment: PropTypes.string,
    onLegendReady: PropTypes.func,
};
