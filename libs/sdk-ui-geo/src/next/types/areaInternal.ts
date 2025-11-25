// (C) 2025 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";
import { IDataVisualizationProps } from "@gooddata/sdk-ui";

import { IGeoAreaChartBaseProps } from "./areaPublic.js";

/**
 * @internal
 */
export interface ICoreGeoAreaChartProps extends IGeoAreaChartBaseProps, IDataVisualizationProps {
    /**
     * Area attribute used to resolve geo collection metadata.
     */
    area?: IAttribute;
}
