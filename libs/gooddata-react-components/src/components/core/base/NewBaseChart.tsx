// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { withEntireDataView } from "../../exp/NewLoadingHOC";
import { ILoadingInjectedProps, defaultCommonVisProps, IBaseChartProps } from "../../exp/props";
import noop = require("lodash/noop");

import { Visualization } from "../../visualizations/NewVisualization";

import { IntlWrapper } from "./IntlWrapper";
import { IntlTranslationsProvider, ITranslationsComponentProps } from "./TranslationsProvider";
import { fixEmptyHeaderItems2 } from "./utils/fixEmptyHeaderItems";
import { BaseVisualization } from "./NewBaseVisualization";
import { getValidColorPalette2 } from "../../visualizations/utils/color";

export class StatelessBaseChart extends BaseVisualization<IBaseChartProps & ILoadingInjectedProps, {}> {
    public static defaultProps: Partial<IBaseChartProps & ILoadingInjectedProps> = {
        ...defaultCommonVisProps,
        onDataTooLarge: noop,
        onLegendReady: noop,
        config: {},
        visualizationComponent: Visualization,
    };

    public renderVisualization(): JSX.Element {
        const { afterRender, height, locale, config, type, dataView, onDataTooLarge, pushData } = this.props;
        const colorPalette = getValidColorPalette2(config);
        const fullConfig = { ...config, type, colorPalette };

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(translationProps: ITranslationsComponentProps) => {
                        // TODO: SDK8: this is evil; mutating the items of readonly array; need to find a conceptual way to do this
                        fixEmptyHeaderItems2(dataView, translationProps.emptyHeaderString);

                        return (
                            <this.props.visualizationComponent
                                dataView={dataView}
                                height={height}
                                config={fullConfig}
                                afterRender={afterRender}
                                onDataTooLarge={onDataTooLarge}
                                onNegativeValues={this.props.onNegativeValues}
                                drillableItems={this.props.drillableItems}
                                onFiredDrillEvent={this.props.onFiredDrillEvent}
                                onLegendReady={this.props.onLegendReady}
                                numericSymbols={translationProps.numericSymbols}
                                locale={locale}
                                pushData={pushData}
                            />
                        );
                    }}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

export const BaseChart = withEntireDataView(StatelessBaseChart);
