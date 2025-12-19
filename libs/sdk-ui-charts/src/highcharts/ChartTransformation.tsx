// (C) 2007-2025 GoodData Corporation

import { type ReactElement, memo, useEffect } from "react";

import Highcharts from "highcharts/esm/highcharts.js";
import { isEqual, omitBy } from "lodash-es";
import { useIntl } from "react-intl";
import { type ContentRect } from "react-measure";
import { invariant } from "ts-invariant";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ITheme } from "@gooddata/sdk-model";
import {
    type ExplicitDrill,
    type OnFiredDrillEvent,
    clusterTitleFromIntl,
    convertDrillableItemsToPredicates,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
} from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { type ILegendOptions } from "@gooddata/sdk-ui-vis-commons";

import { initChartPlugins } from "./adapter/chartPlugins.js";
import { HighChartsMeasuredRenderer } from "./adapter/HighChartsMeasuredRenderer.js";
import {
    HighChartsRenderer,
    type IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./adapter/HighChartsRenderer.js";
import { buildLegendOptions } from "./adapter/legendBuilder.js";
import { getHighchartsOptions } from "./chartTypes/_chartCreators/highChartsCreators.js";
import {
    getDataTooLargeErrorMessage,
    getIsFilteringRecommended,
    validateData,
} from "./chartTypes/_chartOptions/chartLimits.js";
import { getChartOptions } from "./chartTypes/_chartOptions/chartOptionsBuilder.js";
import { isChartSupported, stringifyChartTypes } from "./chartTypes/_util/common.js";
import { type IChartOptions } from "./typings/unsafe.js";
import { type IChartConfig, type OnLegendReady } from "../interfaces/index.js";

export function renderHighCharts(props: IHighChartsRendererProps): ReactElement {
    const childrenRenderer = (contentRect: ContentRect) => (
        <HighChartsRenderer contentRect={contentRect} {...props} />
    );

    return <HighChartsMeasuredRenderer childrenRenderer={childrenRenderer} />;
}

/**
 * @internal
 */
export interface IChartTransformationProps {
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
    onNegativeValues: ((chartOptions: any) => void) | null;

    numericSymbols?: string[];
    theme?: ITheme;
    pushData?(data: any): void;
    renderer?(arg: IHighChartsRendererProps): ReactElement;
}

function ChartTransformationImpl({
    config,
    renderer = renderHighCharts,
    dataView,
    height,
    width,
    afterRender = () => {},
    onDrill = (): boolean => true,
    onLegendReady = () => {},
    locale,
    theme,
    numericSymbols,
    drillableItems = [],
    onDataTooLarge,
    onNegativeValues = null,
    pushData = () => {},
}: IChartTransformationProps) {
    const intl = useIntl();

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

    const legendOptions: ILegendOptions = buildLegendOptions(config.legend, chartOptions, theme, intl);
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
            onDataTooLarge(chartOptions, getDataTooLargeErrorMessage(config.limits!, chartOptions));
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
const ChartTransformationWithInjectedProps = withTheme(ChartTransformationImpl);
export const ChartTransformation = memo(ChartTransformationWithInjectedProps, (props, nextProps) => {
    return isEqual(
        omitBy(props, (v) => typeof v === "function"),
        omitBy(nextProps, (v) => typeof v === "function"),
    );
});
