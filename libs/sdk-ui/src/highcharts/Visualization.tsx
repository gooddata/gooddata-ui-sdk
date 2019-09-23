// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import * as invariant from "invariant";
import { IHeaderPredicate2 } from "../interfaces/HeaderPredicate";
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import isFunction = require("lodash/isFunction");
import omitBy = require("lodash/omitBy");
import Highcharts from "./chart/highcharts/highchartsEntryPoint";
import { INewChartConfig } from "../interfaces/Config";
import { OnFiredDrillEvent } from "../interfaces/Events";

import { isChartSupported, stringifyChartTypes } from "../base/helpers/common";
import { IDrillableItem } from "../interfaces/DrillEvents";
import ChartTransformation, { renderHighCharts } from "./chart/ChartTransformation";

export interface IVisualizationProps {
    height: number;
    width: number;
    config: INewChartConfig;
    numericSymbols?: string[];

    dataView: IDataView;
    drillableItems: Array<IDrillableItem | IHeaderPredicate2>;
    locale?: string;

    onFiredDrillEvent?: OnFiredDrillEvent;
    afterRender?: () => void;
    onDataTooLarge(): void;
    onNegativeValues(): void;
    onLegendReady(): void;
    pushData?(data: any): void;
}

export class Visualization extends React.Component<IVisualizationProps> {
    public static defaultProps = {
        locale: "en-US",
        numericSymbols: [] as string[],
        onFiredDrillEvent: () => true,
        afterRender: noop,
    };

    constructor(props: IVisualizationProps) {
        super(props);

        this.setNumericSymbols(this.props);
    }

    public componentWillReceiveProps(nextProps: IVisualizationProps) {
        this.setNumericSymbols(nextProps);
    }

    public shouldComponentUpdate(nextProps: IVisualizationProps) {
        return !isEqual(omitBy(this.props, isFunction), omitBy(nextProps, isFunction));
    }

    public setNumericSymbols(props: IVisualizationProps) {
        const { numericSymbols } = props;

        if (numericSymbols && numericSymbols.length) {
            Highcharts.setOptions({
                lang: {
                    numericSymbols,
                },
            });
        }
    }

    public render(): JSX.Element {
        const visType = this.props.config.type;

        if (isChartSupported(visType)) {
            const {
                height,
                width,
                config,
                dataView,
                drillableItems,
                onFiredDrillEvent,
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
                    onFiredDrillEvent={onFiredDrillEvent}
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
