// (C) 2007-2025 GoodData Corporation

import { useCallback } from "react";

import {
    ChartType,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import {
    ChartTransformation,
    IChartTransformationProps,
    IHighChartsRendererProps,
    getValidColorPalette,
} from "../../highcharts/index.js";
import { getSanitizedStackingConfig } from "../_commons/sanitizeStacking.js";

export type { IChartTransformationProps, IHighChartsRendererProps };

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside SDK
 *
 * @internal
 */
export interface IRawChartProps extends IChartTransformationProps {
    type: ChartType;
}

/**
 * @internal
 */
export function RawChart(props: IRawChartProps) {
    const {
        dataView,
        afterRender,
        height,
        width,
        locale,
        config = {},
        type,
        onDataTooLarge = () => {},
        pushData,
        theme,
        drillableItems,
        onDrill,
        onNegativeValues,
        onLegendReady = () => {},
    } = props;

    const renderChartTransformation = useCallback(() => {
        const colorPalette = getValidColorPalette(config);
        const fullConfig = { ...config, type, colorPalette };
        const sanitizedConfig = getSanitizedStackingConfig(dataView!.definition, fullConfig);

        return (
            <ThemeContextProvider theme={theme} themeIsLoading={false}>
                <IntlWrapper locale={locale}>
                    <IntlTranslationsProvider>
                        {(translationProps: ITranslationsComponentProps) => {
                            return (
                                <ChartTransformation
                                    height={height}
                                    width={width}
                                    config={sanitizedConfig}
                                    drillableItems={drillableItems}
                                    locale={locale}
                                    dataView={dataView!}
                                    afterRender={afterRender}
                                    onDrill={onDrill}
                                    onDataTooLarge={onDataTooLarge}
                                    onNegativeValues={onNegativeValues}
                                    onLegendReady={onLegendReady}
                                    pushData={pushData}
                                    numericSymbols={translationProps.numericSymbols}
                                />
                            );
                        }}
                    </IntlTranslationsProvider>
                </IntlWrapper>
            </ThemeContextProvider>
        );
    }, [
        afterRender,
        config,
        dataView,
        drillableItems,
        height,
        locale,
        onDataTooLarge,
        onDrill,
        onLegendReady,
        onNegativeValues,
        pushData,
        theme,
        type,
        width,
    ]);

    return renderChartTransformation();
}
