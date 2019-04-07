// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import { LineChart, ColumnChart, ErrorComponent, LoadingComponent, Model } from "@gooddata/react-components";
import sdk from "@gooddata/gooddata-js";
import "@gooddata/react-components/styles/css/main.css";

import { Layout } from "./utils/Layout";
import { SidebarItem } from "./utils/SidebarItem";
import { monthDateIdentifier, projectId, franchiseFeesTag } from "../utils/fixtures";

export class DynamicMeasuresExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            measureList: null,
            error: null,
        };

        this.onMeasureChange = this.onMeasureChange.bind(this);
    }

    componentWillMount() {
        sdk.xhr
            .get(`/gdc/md/${projectId}/tags/${franchiseFeesTag}`)
            .then(response => {
                if (!response.data.entries.length) {
                    return this.setState({
                        measureList: null,
                        error: {
                            message: `No measures with tag ${franchiseFeesTag}`,
                            description: `Please check your project. Franchise fees measures should have assigned the tag ${franchiseFeesTag}.`,
                        },
                    });
                }
                return this.setState({
                    measureList: response.data.entries.map(entry => ({ ...entry, isSelected: true })),
                    error: null,
                });
            })
            .catch(error => {
                this.setState({
                    measureList: null,
                    error: {
                        message: `There was Error while requesting measures by tag ${franchiseFeesTag}`,
                        description: JSON.stringify(error),
                    },
                });
            });
    }

    onMeasureChange(measureIdentifier) {
        const { measureList } = this.state;
        const updatedMeasure = measureList.find(measure => measure.link === measureIdentifier);
        const updatedMeasureIndex = measureList.indexOf(updatedMeasure);
        const updatedMeasures = [...measureList];
        updatedMeasures[updatedMeasureIndex] = {
            ...updatedMeasure,
            isSelected: !updatedMeasure.isSelected,
        };

        this.setState({
            measureList: updatedMeasures,
        });
    }

    getNewMeasureDefinition(measureItem) {
        return Model.measure(measureItem.link).format("#,##0");
    }

    render() {
        const { measureList, error } = this.state;

        if (error) {
            return <ErrorComponent message={error.message} description={error.description} />;
        }

        const loadingBlock = (
            <div className="loading-block">
                {/* language=CSS */}
                <style jsx>{`
                    .loading-block {
                        height: 100%;
                        min-height: 300px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                `}</style>
                <LoadingComponent />
            </div>
        );

        const sidebar = measureList ? (
            <div className="s-dynamic-measures-sidebar">
                {/* language=CSS */}
                <style jsx>{`
                    h3 {
                        margin-top: 0;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                        margin: 0;
                    }
                `}</style>
                <h3>Measures</h3>
                <ul>
                    {measureList.map(({ title, link, isSelected }) => (
                        <SidebarItem
                            key={link}
                            label={title}
                            id={link}
                            isSelected={isSelected}
                            onClick={this.onMeasureChange}
                        />
                    ))}
                </ul>
            </div>
        ) : (
            loadingBlock
        );

        const config = { legend: { position: "bottom" } };
        let content = loadingBlock;

        if (measureList) {
            const selectedMeasures = measureList.filter(measure => measure.isSelected);
            const measures = selectedMeasures.map(this.getNewMeasureDefinition);

            if (selectedMeasures.length) {
                const attribute = Model.attribute(monthDateIdentifier);

                content = (
                    <div className="graph-wrapper">
                        {/* language=CSS */}
                        <style jsx>{`
                            .graph-wrapper {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                            }
                            .graph {
                                height: 300px;
                            }
                        `}</style>
                        <div className="graph graph-line s-dynamic-measures-line-chart">
                            <LineChart
                                projectId={projectId}
                                measures={measures}
                                trendBy={attribute}
                                onLoadingChanged={this.onLoadingChanged}
                                onError={this.onError}
                                config={config}
                            />
                        </div>
                        <div className="graph graph-column s-dynamic-measures-column-chart">
                            <ColumnChart
                                projectId={projectId}
                                measures={measures}
                                onLoadingChanged={this.onLoadingChanged}
                                onError={this.onError}
                                config={config}
                            />
                        </div>
                    </div>
                );
            } else {
                content = <ErrorComponent message="Please select at least one measure" />;
            }
        }

        return (
            <div className="s-dynamic-measures">
                <Layout sidebar={sidebar}>{content}</Layout>
            </div>
        );
    }
}

export default DynamicMeasuresExample;
