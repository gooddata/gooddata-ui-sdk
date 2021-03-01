// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import React from "react";
import { IDrillableItem, OnFiredDrillEvent, IHeaderPredicate } from "@gooddata/sdk-ui";
import { ChartTransformation, renderHighCharts } from "./ChartTransformation";
import Highcharts from "./lib";
import { IChartConfig } from "../interfaces";

import { isChartSupported, stringifyChartTypes } from "./chartTypes/_util/common";
import isEqual from "lodash/isEqual";
import isFunction from "lodash/isFunction";
import noop from "lodash/noop";
import omitBy from "lodash/omitBy";

/**
 * @internal
 */
export interface IVisualizationProps {
    height: number;
    width: number;
    config: IChartConfig;
    numericSymbols?: string[];

    dataView: IDataView;
    drillableItems: Array<IDrillableItem | IHeaderPredicate>;
    locale?: string;

    onDrill?: OnFiredDrillEvent;
    afterRender?: () => void;
    onDataTooLarge(): void;
    onNegativeValues(): void;
    onLegendReady(): void;
    pushData?(data: any): void;
}

/**
 * @internal
 */
export class Visualization extends React.Component<IVisualizationProps> {
    public static defaultProps = {
        locale: "en-US",
        numericSymbols: [] as string[],
        onDrill: (): boolean => true,
        afterRender: noop,
    };

    constructor(props: IVisualizationProps) {
        super(props);

        this.setNumericSymbols(this.props);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IVisualizationProps): void {
        this.setNumericSymbols(nextProps);
    }

    public shouldComponentUpdate(nextProps: IVisualizationProps): boolean {
        return !isEqual(omitBy(this.props, isFunction), omitBy(nextProps, isFunction));
    }

    public setNumericSymbols(props: IVisualizationProps): void {
        const { numericSymbols } = props;

        if (numericSymbols && numericSymbols.length) {
            Highcharts.setOptions({
                lang: {
                    numericSymbols,
                },
            });
        }
    }

    public render(): React.ReactNode {
        const visType = this.props.config.type;

        if (isChartSupported(visType)) {
            const {
                height,
                width,
                config,
                dataView,
                drillableItems,
                onDrill,
                afterRender,
                onDataTooLarge,
                onNegativeValues,
                onLegendReady,
                locale,
                pushData,
            } = this.props;

            return (
                <ChartTransformation
                    height={height}
                    width={width}
                    config={config}
                    drillableItems={drillableItems}
                    locale={locale}
                    dataView={dataView}
                    afterRender={afterRender}
                    onDrill={onDrill}
                    onDataTooLarge={onDataTooLarge}
                    onNegativeValues={onNegativeValues}
                    onLegendReady={onLegendReady}
                    pushData={pushData}
                    renderer={renderHighCharts}
                />
            );
        }

        invariant(
            false,
            `Unknown visualization type: ${visType}. Supported visualization types: ${stringifyChartTypes()}`,
        );

        return null;
    }
}
