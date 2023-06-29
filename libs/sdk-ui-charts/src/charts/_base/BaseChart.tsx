// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ICoreChartProps, OnLegendReady } from "../../interfaces/index.js";
import { getValidColorPalette, ChartTransformation } from "../../highcharts/index.js";
import noop from "lodash/noop.js";
import { defaultCoreChartProps } from "../_commons/defaultProps.js";
import {
    newErrorMapping,
    IErrorDescriptors,
    ErrorCodes,
    ChartType,
    IErrorProps,
    ILoadingProps,
    IntlWrapper,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ILoadingInjectedProps,
    withEntireDataView,
} from "@gooddata/sdk-ui";
import { getSanitizedStackingConfig } from "../_commons/sanitizeStacking.js";
import { ITheme } from "@gooddata/sdk-model";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

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

class StatelessBaseChart extends React.Component<Props> {
    public static defaultProps: Pick<
        Partial<Props>,
        keyof typeof defaultCoreChartProps | "onDataTooLarge" | "onLegendReady" | "config"
    > = {
        ...defaultCoreChartProps,
        onDataTooLarge: noop,
        onLegendReady: noop,
        config: {},
    };

    private readonly errorMap: IErrorDescriptors;

    constructor(props: Props) {
        super(props);

        this.errorMap = newErrorMapping(props.intl);
    }

    public render(): JSX.Element {
        const { dataView, error, isLoading } = this.props;

        const ErrorComponent = this.props.ErrorComponent as React.ComponentType<IErrorProps>;
        const LoadingComponent = this.props.LoadingComponent as React.ComponentType<ILoadingProps>;

        if (error) {
            const errorProps =
                this.errorMap[
                    Object.prototype.hasOwnProperty.call(this.errorMap, error)
                        ? error
                        : ErrorCodes.UNKNOWN_ERROR
                ];
            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
        }

        // when in pageble mode (getPage present) never show loading (its handled by the component)
        if (isLoading || !dataView) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderChartTransformation();
    }

    private renderChartTransformation(): JSX.Element {
        const {
            afterRender,
            height,
            width,
            locale,
            config,
            type,
            dataView,
            onDataTooLarge,
            pushData,
            theme,
            drillableItems,
            onDrill,
            onNegativeValues,
            onLegendReady,
        } = this.props;
        const colorPalette = getValidColorPalette(config);
        const fullConfig = { ...config, type, colorPalette };
        const sanitizedConfig = getSanitizedStackingConfig(dataView.definition, fullConfig);

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
                                    dataView={dataView}
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
    }
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disappear.
 *
 * @internal
 */
export const BaseChart = withEntireDataView(StatelessBaseChart);
