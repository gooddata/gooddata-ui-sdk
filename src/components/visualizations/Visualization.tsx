// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as invariant from "invariant";
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import isFunction = require("lodash/isFunction");
import omitBy = require("lodash/omitBy");
import { Highcharts } from "./chart/Chart";
import { IChartConfig } from "../../interfaces/Config";
import { OnFiredDrillEvent } from "../../interfaces/Events";

import { Execution } from "@gooddata/typings";

import { isTable, isChartSupported, stringifyChartTypes } from "./utils/common";
import { TableTransformation } from "./table/TableTransformation";
import { IDrillableItem } from "../../interfaces/DrillEvents";
import ChartTransformation, { IExecutionRequest, renderHighCharts } from "./chart/ChartTransformation";

export interface IVisualizationProps {
    height: number;
    width: number;
    config: IChartConfig;
    numericSymbols?: string[];

    executionRequest: IExecutionRequest;
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    drillableItems: Array<IDrillableItem | IHeaderPredicate>;
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

        if (isTable(visType)) {
            return (
                <TableTransformation
                    {...this.props}
                    executionRequest={{
                        execution: {
                            afm: this.props.executionRequest.afm,
                            resultSpec: this.props.executionRequest.resultSpec,
                        },
                    }}
                />
            );
        }

        if (isChartSupported(visType)) {
            const {
                height,
                width,
                config,
                executionRequest,
                executionResponse,
                executionResult,
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
                    executionRequest={executionRequest}
                    executionResponse={executionResponse}
                    executionResult={executionResult}
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
