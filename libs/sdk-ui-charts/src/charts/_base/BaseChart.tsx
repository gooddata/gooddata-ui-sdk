// (C) 2007-2025 GoodData Corporation

import { ComponentType, useMemo } from "react";

import { ITheme } from "@gooddata/sdk-model";
import {
    ChartType,
    ErrorCodes,
    IErrorDescriptors,
    IErrorProps,
    ILoadingInjectedProps,
    ILoadingProps,
    newErrorMapping,
    withEntireDataView,
} from "@gooddata/sdk-ui";

import { IRawChartProps, RawChart } from "./RawChart.js";
import { ICoreChartProps, OnLegendReady } from "../../interfaces/index.js";
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
        const key = Object.prototype.hasOwnProperty.call(errorMap, seType)
            ? seType
            : Object.prototype.hasOwnProperty.call(errorMap, error)
              ? error
              : ErrorCodes.UNKNOWN_ERROR;

        const errorProps = errorMap[key];
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
