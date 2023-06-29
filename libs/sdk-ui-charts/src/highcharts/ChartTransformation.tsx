// (C) 2007-2022 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { ITheme } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import React from "react";
import { ContentRect } from "react-measure";

import {
    convertDrillableItemsToPredicates,
    OnFiredDrillEvent,
    ExplicitDrill,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
} from "@gooddata/sdk-ui";
import { IChartConfig, OnLegendReady } from "../interfaces/index.js";
import { getChartOptions } from "./chartTypes/_chartOptions/chartOptionsBuilder.js";
import { getHighchartsOptions } from "./chartTypes/_chartCreators/highChartsCreators.js";
import {
    HighChartsRenderer,
    IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./adapter/HighChartsRenderer.js";
import { HighChartsMeasuredRenderer } from "./adapter/HighChartsMeasuredRenderer.js";
import buildLegendOptions from "./adapter/legendBuilder.js";
import noop from "lodash/noop.js";
import isEqual from "lodash/isEqual.js";
import isFunction from "lodash/isFunction.js";
import omitBy from "lodash/omitBy.js";
import { IChartOptions } from "./typings/unsafe.js";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { ILegendOptions } from "@gooddata/sdk-ui-vis-commons";
import { validateData } from "./chartTypes/_chartOptions/chartLimits.js";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import Highcharts from "./lib/index.js";
import { isChartSupported, stringifyChartTypes } from "./chartTypes/_util/common.js";

export function renderHighCharts(props: IHighChartsRendererProps): JSX.Element {
    const childrenRenderer = (contentRect: ContentRect) => (
        <HighChartsRenderer contentRect={contentRect} {...props} />
    );

    return <HighChartsMeasuredRenderer childrenRenderer={childrenRenderer} />;
}

/**
 * @internal
 */
export interface IChartTransformationProps extends WrappedComponentProps {
    height: number;
    width: number;
    config: IChartConfig;
    drillableItems: ExplicitDrill[];
    locale: string;

    dataView: IDataView;

    onDrill: OnFiredDrillEvent;
    onLegendReady: OnLegendReady;

    afterRender(): void;
    onDataTooLarge(chartOptions: any): void;
    onNegativeValues(chartOptions: any): void;

    numericSymbols?: string[];
    theme?: ITheme;
    pushData?(data: any): void;
    renderer?(arg: IHighChartsRendererProps): JSX.Element;
}

const ChartTransformationImpl = (props: IChartTransformationProps) => {
    const {
        config,
        renderer = renderHighCharts,
        dataView,
        height,
        width,
        afterRender = noop,
        onDrill = (): boolean => true,
        onLegendReady = noop,
        locale,
        intl,
        theme,
        numericSymbols,
        drillableItems = [],
        onDataTooLarge,
        onNegativeValues = null,
        pushData = noop,
    } = props;
    const visType = config.type;
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
    const chartOptions: IChartOptions = getChartOptions(
        dataView,
        config,
        drillablePredicates,
        emptyHeaderTitleFromIntl(intl),
        theme,
        totalColumnTitleFromIntl(intl),
    );
    const legendOptions: ILegendOptions = buildLegendOptions(config.legend, chartOptions, intl);
    const validationResult = validateData(config.limits, chartOptions);
    const drillConfig = { dataView, onDrill };
    const hcOptions = getHighchartsOptions(
        chartOptions,
        drillConfig,
        config,
        dataView.definition,
        intl,
        theme,
    );
    const rendererProps = {
        chartOptions,
        hcOptions,
        height,
        width,
        afterRender,
        onLegendReady,
        locale,
        legend: legendOptions,
        theme,
    };

    if (validationResult.dataTooLarge) {
        // always force onDataTooLarge error handling
        invariant(onDataTooLarge, "Visualization's onDataTooLarge callback is missing.");
        onDataTooLarge(chartOptions);
    } else if (validationResult.hasNegativeValue) {
        // ignore hasNegativeValue if validation already fails on dataTooLarge
        // force onNegativeValues error handling only for pie chart.
        // hasNegativeValue can be true only for pie chart.
        invariant(
            onNegativeValues,
            '"onNegativeValues" callback required for pie chart transformation is missing.',
        );
        onNegativeValues(chartOptions);
    }

    pushData({
        propertiesMeta: {
            legend_enabled: legendOptions.toggleEnabled,
        },
        colors: {
            colorAssignments: chartOptions.colorAssignments,
            colorPalette: chartOptions.colorPalette,
        },
    });

    if (!isChartSupported(visType)) {
        invariant(
            false,
            `Unknown visualization type: ${visType}. Supported visualization types: ${stringifyChartTypes()}`,
        );
    }

    if (numericSymbols?.length) {
        Highcharts.setOptions({
            lang: {
                numericSymbols,
            },
        });
    }

    if (validationResult.dataTooLarge || validationResult.hasNegativeValue) {
        return null;
    }
    const resetZoomButtonTooltip = intl
        ? intl.formatMessage({ id: "visualization.tooltip.resetZoom" })
        : null;
    return renderer({ ...rendererProps, chartRenderer, legendRenderer, resetZoomButtonTooltip });
};

/**
 * @internal
 */
const ChartTransformationWithInjectedProps = injectIntl(withTheme(ChartTransformationImpl));
export const ChartTransformation = React.memo(ChartTransformationWithInjectedProps, (props, nextProps) => {
    return isEqual(omitBy(props, isFunction), omitBy(nextProps, isFunction));
});
