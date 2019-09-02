// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";
import { ChartConfigPropType } from "./ChartConfig";
import { EventsPropTypes } from "./Events";
import { FiltersPropType } from "./Filters";
import { DrillableItemPropType, DrillablePredicatePropType } from "./DrillableItem";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const VisualizationPropType = {
    config: ChartConfigPropType,
    ...EventsPropTypes,
    filters: FiltersPropType,
    drillableItems: PropTypes.arrayOf(
        PropTypes.oneOfType([DrillableItemPropType, DrillablePredicatePropType]),
    ),
    projectId: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    uri: PropTypes.string,
    uriResolver: PropTypes.func,
    locale: PropTypes.string,
    fetchVisObject: PropTypes.func,
    fetchVisualizationClass: PropTypes.func,
    BaseChartComponent: PropTypes.func,
    LoadingComponent: PropTypes.func,
    ErrorComponent: PropTypes.func,
    onLegendReady: PropTypes.func,
};
