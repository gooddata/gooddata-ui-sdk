// (C) 2007-2025 GoodData Corporation

import { ComponentType, useCallback, useMemo } from "react";

import { noop } from "lodash-es";

import { ITheme } from "@gooddata/sdk-model";
import {
    ChartType,
    ErrorCodes,
    IErrorDescriptors,
    IErrorProps,
    ILoadingInjectedProps,
    ILoadingProps,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
    newErrorMapping,
    withEntireDataView,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { ChartTransformation, getValidColorPalette } from "../../highcharts/index.js";
import { ICoreChartProps, OnLegendReady } from "../../interfaces/index.js";
import { withDefaultCoreChartProps } from "../_commons/defaultProps.js";
import { getSanitizedStackingConfig } from "../_commons/sanitizeStacking.js";

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
    const {
        dataView,
        error,
        seType,
        isLoading,
        ErrorComponent,
        LoadingComponent,
        afterRender,
        height,
        width,
        locale,
        config = {},
        type,
        onDataTooLarge = noop,
        pushData,
        theme,
        drillableItems,
        onDrill,
        onNegativeValues,
        onLegendReady = noop,
        intl,
    } = withDefaultCoreChartProps(props);

    const errorMap: IErrorDescriptors = useMemo(() => newErrorMapping(intl), [intl]);

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

    return renderChartTransformation();
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disappear.
 *
 * @internal
 */
export const BaseChart = withEntireDataView(StatelessBaseChart);
