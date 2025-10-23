// (C) 2025 GoodData Corporation

// import { IDataView } from "@gooddata/sdk-backend-spi";
import { IAttribute } from "@gooddata/sdk-model";
import { IDataVisualizationProps } from "@gooddata/sdk-ui";

import { IGeoPushpinChartNextBaseProps } from "./public.js";

/**
 * @internal
 */
export interface ICoreGeoPushpinChartNextProps
    extends IGeoPushpinChartNextBaseProps,
        IDataVisualizationProps {}

/**
 * @internal
 */
export interface IGeoPushpinChartNextResolvedProps extends IGeoPushpinChartNextBaseProps {
    location?: IAttribute;
    latitude?: IAttribute;
    longitude?: IAttribute;
}
