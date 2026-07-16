// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo, useEffect, useRef } from "react";

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
    anomaliesTitleFromIntl,
    clusterTitleFromIntl,
    convertDrillableItemsToPredicates,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
} from "@gooddata/sdk-ui";
import { useReferenceTheme, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { type ILegendOptions, type ITooltipExecution, useTooltipLookup } from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig } from "../interfaces/chartConfig.js";
import { type OnLegendReady } from "../interfaces/chartProps.js";

import { initChartPlugins } from "./adapter/chartPlugins.js";
import { HighChartsMeasuredRenderer } from "./adapter/HighChartsMeasuredRenderer.js";
import {
    HighChartsRenderer,
    type IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./adapter/HighChartsRenderer.js";
import { buildLegendOptions } from "./adapter/legendBuilder.js";
import { buildIdentifierMapping } from "./chartTypes/_chartCreators/customTooltip/identifierMapping.js";
import { buildChartReferenceLookup } from "./chartTypes/_chartCreators/customTooltip/tooltipLookup.js";
import { getHighchartsOptions } from "./chartTypes/_chartCreators/highChartsCreators.js";
import {
    getDataTooLargeErrorMessage,
    getIsFilteringRecommended,
    validateData,
} from "./chartTypes/_chartOptions/chartLimits.js";
import { getChartOptions } from "./chartTypes/_chartOptions/chartOptionsBuilder.js";
import { isChartSupported, stringifyChartTypes } from "./chartTypes/_util/common.js";
import { type IChartOptions, type ICustomTooltipRuntime } from "./typings/unsafe.js";

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
    /**
     * Theme of record for derived color computations; when the chart renders in an isolated
     * React root (pluggable visualizations), the reference cannot travel via context and
     * must be passed as a prop.
     */
    referenceTheme?: ITheme;
    pushData?(data: any): void;
    renderer?(arg: IHighChartsRendererProps): ReactElement;

    tooltipExecution?: ITooltipExecution;
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
    referenceTheme: referenceThemeProp,
    numericSymbols,
    drillableItems = [],
    onDataTooLarge,
    onNegativeValues = null,
    pushData = () => {},
    tooltipExecution,
}: IChartTransformationProps) {
    const intl = useIntl();
    const referenceThemeFromContext = useReferenceTheme();
    const referenceTheme = referenceThemeProp ?? referenceThemeFromContext;

    const visType = config.type;
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

    // `undefined` until the first result lands (treated as "no external values").
    // Placeholder strings are applied later, at render time, in formatTooltip.
    const tooltipLookup = useTooltipLookup(tooltipExecution, config.separators);

    const customTooltipRuntimeRef = useRef<ICustomTooltipRuntime>({});

    const chartOptions: IChartOptions = getChartOptions(
        dataView,
        config,
        drillablePredicates,
        emptyHeaderTitleFromIntl(intl),
        theme,
        totalColumnTitleFromIntl(intl),
        clusterTitleFromIntl(intl),
        anomaliesTitleFromIntl(intl),
        referenceTheme,
    );

    if (config.customTooltip?.enabled) {
        const identifierMapping = buildIdentifierMapping(dataView.definition, config.type);
        customTooltipRuntimeRef.current.identifierMapping = identifierMapping;
        customTooltipRuntimeRef.current.tooltipLookup = tooltipLookup;
        customTooltipRuntimeRef.current.chartLookup = buildChartReferenceLookup(
            dataView,
            identifierMapping,
            config.separators,
        );
    } else {
        customTooltipRuntimeRef.current.identifierMapping = undefined;
        customTooltipRuntimeRef.current.tooltipLookup = undefined;
        customTooltipRuntimeRef.current.chartLookup = undefined;
    }
    chartOptions.customTooltipRuntime = customTooltipRuntimeRef.current;

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
            // ignore hasNegativeValue if validation already fails on dataTooLarge.
            // hasNegativeValue is true for pie-family charts (any negative value) and for Mekko
            // (negative Width). onNegativeValues is always supplied via withEntireDataView, so this
            // invariant is a safety guard, not a pie-only constraint — both route to the empty state.
            invariant(
                onNegativeValues,
                '"onNegativeValues" callback required for negative-value error handling is missing.',
            );
            onNegativeValues(chartOptions);
        } else {
            isFilteringRecommended = getIsFilteringRecommended(chartOptions);
        }

        pushData({
            propertiesMeta: {
                legend_enabled: legendOptions.toggleEnabled,
                isFilteringRecommended,
                // Mekko: "Stack to 100%" was requested but downgraded to absolute stacking because the
                // Height metric has negative values (percent of mixed-sign segments is undefined).
                // Surfaced as an info note in AD; the property stays set so 100% re-enables once cleaned.
                // No Stack-by means no percent stacking to downgrade (getStackingConfig only yields
                // "percent" with a stack attribute), so the note must not show.
                stackToPercentDisabledByNegativeValues:
                    Boolean(config.stackMeasuresToPercent) &&
                    Boolean(chartOptions.hasStackByAttribute) &&
                    Boolean(chartOptions.stackToPercentBlockedByNegativeValues),
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
