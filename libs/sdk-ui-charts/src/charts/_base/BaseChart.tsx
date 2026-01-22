// (C) 2007-2026 GoodData Corporation

import { type ComponentType, useMemo } from "react";

import { type ITheme } from "@gooddata/sdk-model";
import {
    type ChartType,
    ErrorCodes,
    type IErrorDescriptors,
    type IErrorProps,
    type ILoadingInjectedProps,
    type ILoadingProps,
    newErrorMapping,
    withEntireDataView,
} from "@gooddata/sdk-ui";

import { type IRawChartProps, RawChart } from "./RawChart.js";
import { type ICoreChartProps, type OnLegendReady } from "../../interfaces/chartProps.js";
import { withDefaultCoreChartProps } from "../_commons/defaultProps.js";

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disappear.
 *
 * @internal
 */
export interface IBaseChartProps extends ICoreChartProps {
    type: ChartType;
    onLegendReady?: OnLegendReady;
    theme?: ITheme;
}

type Props = IBaseChartProps & ILoadingInjectedProps;

function StatelessBaseChart(props: Props) {
    const { dataView, error, seType, isLoading, ErrorComponent, LoadingComponent, intl, ...restProps } =
        withDefaultCoreChartProps(props);

    const errorMap: IErrorDescriptors = useMemo(() => newErrorMapping(intl), [intl]);

    const TypedErrorComponent = ErrorComponent as ComponentType<IErrorProps>;
    const TypedLoadingComponent = LoadingComponent as ComponentType<ILoadingProps>;

    if (error) {
        const errorProps =
            (seType && errorMap[seType]) || errorMap[error] || errorMap[ErrorCodes.UNKNOWN_ERROR];
        return TypedErrorComponent ? <TypedErrorComponent code={error} {...errorProps} /> : null;
    }

    // when in pageble mode (getPage present) never show loading (its handled by the component)
    if (isLoading || !dataView) {
        return TypedLoadingComponent ? <TypedLoadingComponent /> : null;
    }

    return <RawChart dataView={dataView} {...(restProps as Omit<IRawChartProps, "dataView">)} />;
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside SDK; will disappear.
 *
 * @internal
 */
export const BaseChart = withEntireDataView(StatelessBaseChart);
