// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { CoreComponents } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid, XAxis, YAxis } from "recharts";
import { get, unzip, range } from "lodash";

import { Ldm } from "../../ldm";
import { DEFAULT_COLOR_PALETTE } from "../../constants/colors";

const { BaseChart } = CoreComponents;

export class CustominsightView extends Component {
    static defaultProps = {
        height: 300,
    };

    constructor(props) {
        super(props);
        this.state = {
            displayRawData: false,
        };
        this.toggleDisplayRawData = this.toggleDisplayRawData.bind(this);
    }

    getData(executionResult) {
        const executionData = get(executionResult, "data", []);

        const data = unzip(executionData).map((pointArray, valueIndex) => {
            const label = get(executionResult, `headerItems[1][0][${valueIndex}].attributeHeaderItem.name`);
            const pointObject = {
                label,
            };
            pointArray.forEach((pointItem, pointItemIndex) => {
                pointObject[pointItemIndex] = parseFloat(pointItem);
            });

            return pointObject;
        });

        return data;
    }

    toggleDisplayRawData() {
        this.setState({ displayRawData: !this.state.displayRawData });
    }

    render() {
        const { executionResult, height } = this.props;
        const { displayRawData } = this.state;

        const data = this.getData(executionResult);

        if (!data.length) {
            return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
        }

        const measures = get(executionResult, "headerItems[0][0]");

        const bars = range(measures.length).map((barIndex) => {
            return (
                <Bar
                    key={barIndex}
                    name={measures[barIndex].measureHeaderItem.name}
                    dataKey={barIndex}
                    fill={DEFAULT_COLOR_PALETTE[barIndex]}
                    label={{ position: "top" }}
                />
            );
        });

        return (
            <div className="s-insightView-custom">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, (dataMax) => dataMax * 1.1]} />
                        <Legend />
                        {bars}
                    </BarChart>
                </ResponsiveContainer>
                <div>
                    <p>
                        <button className="gd-button gd-button-secondary" onClick={this.toggleDisplayRawData}>
                            Toggle Raw Data
                        </button>
                    </p>
                    {displayRawData ? (
                        <div>
                            <pre>{JSON.stringify(executionResult, null, "  ")}</pre>
                            <pre>{JSON.stringify(data, null, "  ")}</pre>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

const CustomBaseChart = (props) => {
    return <BaseChart {...props} insightViewComponent={(visProps) => <CustominsightView {...visProps} />} />;
};

export class CustominsightViewExample extends Component {
    render() {
        return (
            <InsightView
                insight={Ldm.Insights.FranchiseFees}
                // TODO: SDK8 Decide whether add dimesion prop to InsightView
                // BaseChartComponent={CustomBaseChart}
            />
        );
    }
}

export default CustominsightViewExample;
