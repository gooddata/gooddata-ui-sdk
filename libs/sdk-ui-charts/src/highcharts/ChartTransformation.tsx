// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useEffect } from "react";

import Highcharts from "highcharts/esm/highcharts.js";
import isEqual from "lodash/isEqual.js";
import isFunction from "lodash/isFunction.js";
import noop from "lodash/noop.js";
import omitBy from "lodash/omitBy.js";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { ContentRect } from "react-measure";
import { invariant } from "ts-invariant";

import { IDataView } from "@gooddata/sdk-backend-spi";
import { ITheme } from "@gooddata/sdk-model";
import {
    ExplicitDrill,
    OnFiredDrillEvent,
    clusterTitleFromIntl,
    convertDrillableItemsToPredicates,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
} from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { ILegendOptions } from "@gooddata/sdk-ui-vis-commons";

import { initChartPlugins } from "./adapter/chartPlugins.js";
import { HighChartsMeasuredRenderer } from "./adapter/HighChartsMeasuredRenderer.js";
import {
    HighChartsRenderer,
    IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./adapter/HighChartsRenderer.js";
import buildLegendOptions from "./adapter/legendBuilder.js";
import { getHighchartsOptions } from "./chartTypes/_chartCreators/highChartsCreators.js";
import {
    getDataTooLargeErrorMessage,
    getIsFilteringRecommended,
    validateData,
} from "./chartTypes/_chartOptions/chartLimits.js";
import { getChartOptions } from "./chartTypes/_chartOptions/chartOptionsBuilder.js";
import { isChartSupported, stringifyChartTypes } from "./chartTypes/_util/common.js";
import { IChartOptions } from "./typings/unsafe.js";
import { IChartConfig, OnLegendReady } from "../interfaces/index.js";

export function renderHighCharts(props: IHighChartsRendererProps): ReactElement {
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
    onDataTooLarge(chartOptions: any, errorMessage?: string): void;
    onNegativeValues(chartOptions: any): void;

    numericSymbols?: string[];
    theme?: ITheme;
    pushData?(data: any): void;
    renderer?(arg: IHighChartsRendererProps): ReactElement;
}

function ChartTransformationImpl(props: IChartTransformationProps) {
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
        clusterTitleFromIntl(intl),
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

    useEffect(() => {
        let isFilteringRecommended = false;
        if (validationResult.dataTooLarge) {
            // always force onDataTooLarge error handling
            invariant(onDataTooLarge, "Visualization's onDataTooLarge callback is missing.");
            onDataTooLarge(chartOptions, getDataTooLargeErrorMessage(config.limits, chartOptions));
        } else if (validationResult.hasNegativeValue) {
            // ignore hasNegativeValue if validation already fails on dataTooLarge
            // force onNegativeValues error handling only for pie chart.
            // hasNegativeValue can be true only for pie chart.
            invariant(
                onNegativeValues,
                '"onNegativeValues" callback required for pie chart transformation is missing.',
            );
            onNegativeValues(chartOptions);
        } else {
            isFilteringRecommended = getIsFilteringRecommended(chartOptions);
        }

        pushData({
            propertiesMeta: {
                legend_enabled: legendOptions.toggleEnabled,
                isFilteringRecommended,
            },
            colors: {
                colorAssignments: chartOptions.colorAssignments,
                colorPalette: chartOptions.colorPalette,
            },
        });
    });

    if (!isChartSupported(visType)) {
        invariant(
            false,
            `Unknown visualization type: ${visType}. Supported visualization types: ${stringifyChartTypes()}`,
        );
    }

    // Optional plugin init based on config flag
    // Repeatedly calling handled internally by the plugin
    initChartPlugins(Highcharts, Boolean(config.enableAccessibleTooltip), theme ?? null);

    if (numericSymbols?.length) {
        Highcharts.setOptions({
            lang: {
                numericSymbols,
                thousandsSep: " ", // we need to set thousands separator to space to keep it consistent with previous version 9.3.0 this never respect user settings.
            },
        });
    }

    if (validationResult.dataTooLarge || validationResult.hasNegativeValue) {
        return null;
    }
    const resetZoomButtonTooltip = intl
        ? intl.formatMessage({ id: "visualization.tooltip.resetZoom" })
        : null;

    return renderer({
        chartRenderer,
        legendRenderer,
        resetZoomButtonTooltip,
        chartOptions,
        hcOptions,
        height,
        width,
        afterRender,
        onLegendReady,
        locale,
        legend: legendOptions,
        theme,
        config,
    });
}

/**
 * @internal
 */
const ChartTransformationWithInjectedProps = injectIntl(withTheme(ChartTransformationImpl));
export const ChartTransformation = React.memo(ChartTransformationWithInjectedProps, (props, nextProps) => {
    return isEqual(omitBy(props, isFunction), omitBy(nextProps, isFunction));
});
