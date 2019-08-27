// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Visualization, CoreComponents } from "@gooddata/react-components";
import { ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid, XAxis, YAxis } from "recharts";
import { get, unzip, range } from "lodash";

import { projectId, franchiseFeesVisualizationIdentifier } from "../utils/fixtures";
import { DEFAULT_COLOR_PALETTE } from "../utils/colors";

const { BaseChart } = CoreComponents;

export class CustomVisualization extends Component {
    static propTypes = {
        height: PropTypes.number,
        executionResult: PropTypes.object.isRequired,
    };

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

        const bars = range(measures.length).map(barIndex => {
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
            <div className="s-visualization-custom">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, dataMax => dataMax * 1.1]} />
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

const CustomBaseChart = props => {
    return (
        <BaseChart {...props} visualizationComponent={visProps => <CustomVisualization {...visProps} />} />
    );
};

export class CustomVisualizationExample extends Component {
    render() {
        return (
            <Visualization
                projectId={projectId}
                identifier={franchiseFeesVisualizationIdentifier}
                BaseChartComponent={CustomBaseChart}
            />
        );
    }
}

export default CustomVisualizationExample;
