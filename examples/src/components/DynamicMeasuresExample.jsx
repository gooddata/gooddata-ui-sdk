/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from 'react';
import { AfmComponents } from '@gooddata/react-components';
import sdk from 'gooddata';

import '@gooddata/react-components/styles/css/main.css';

import { Layout } from './utils/Layout';
import { Loading } from './utils/Loading';
import { Error } from './utils/Error';
import { SidebarItem } from './utils/SidebarItem';
import {
    monthDateIdentifier,
    projectId,
    franchiseFeesTag
} from '../utils/fixtures';

const { LineChart, ColumnChart } = AfmComponents;

export class DynamicMeasuresExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            measureList: null,
            error: null
        };

        this.onMeasureChange = this.onMeasureChange.bind(this);
    }

    componentWillMount() {
        sdk.xhr.get(`/gdc/md/${projectId}/tags/${franchiseFeesTag}`).then(
            (response) => {
                if (!response.entries.length) {
                    return this.setState({
                        measureList: null,
                        error: {
                            status: '404',
                            message: `No measures with tag ${franchiseFeesTag}. Please check your project.
                                Franchise fees measures should have assigned the tag ${franchiseFeesTag}.`
                        }
                    });
                }
                return this.setState({
                    measureList: response.entries.map(entry => ({ ...entry, isSelected: true })),
                    error: null
                });
            }
        ).catch((error) => {
            this.setState({
                measureList: null,
                error: { status: '400', message: `Error while requesting measures by tag ${franchiseFeesTag}. ${JSON.stringify(error)}` }
            });
        });
    }

    onMeasureChange(measureIdentifier) {
        const { measureList } = this.state;
        const updatedMeasure = measureList.find(measure => (measure.link === measureIdentifier));
        const updatedMeasureIndex = measureList.indexOf(updatedMeasure);
        const updatedMeasures = [...measureList];
        updatedMeasures[updatedMeasureIndex] = {
            ...updatedMeasure,
            isSelected: !updatedMeasure.isSelected
        };

        this.setState({
            measureList: updatedMeasures
        });
    }

    getMeasureDefinition(measureItem) {
        return {
            localIdentifier: measureItem.link.split('/').reverse()[0],
            definition: {
                measure: {
                    item: {
                        uri: measureItem.link
                    }
                }
            },
            format: '#,##0'
        };
    }

    render() {
        const { measureList, error } = this.state;

        if (error) {
            return <Error error={error} />;
        }

        const loadingBlock = (<div className="loading-block" >
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
            <Loading />
        </div>);

        const sidebar = measureList
            ? (
                <div className="s-dynamic-measures-sidebar">
                    {/* language=CSS */}
                    <style jsx>{`
                        h3 {
                            margin-top: 0;
                        }
                        .ul {
                            list-style-type: 'none';
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
            )
            : loadingBlock;

        const config = { legend: { position: 'bottom' } };
        let content = loadingBlock;

        if (measureList) {
            const selectedMeasures = measureList.filter(measure => measure.isSelected);
            const measures = selectedMeasures.map(this.getMeasureDefinition);

            if (selectedMeasures.length) {
                const lineChartAfm = {
                    measures,
                    attributes: [
                        {
                            displayForm: {
                                identifier: monthDateIdentifier
                            },
                            localIdentifier: 'month'
                        }
                    ]
                };
                const columnChartAfm = {
                    measures
                };

                content = (
                    <div className="graph-wrapper">
                        {/* language=CSS */}
                        <style jsx>{`
                            .graph-wrapper {
                                display: flex;
                            }
                            .graph {
                                height: 300px;
                            }
                            .graph-line {
                                flex: 1 1 60%;
                                margin-right: 20px;
                            }
                            .graph-column {
                                flex: 1 1 40%;
                            }
                        `}</style>
                        <div className="graph graph-line s-dynamic-measures-line-chart">
                            <LineChart
                                projectId={projectId}
                                afm={lineChartAfm}
                                onLoadingChanged={this.onLoadingChanged}
                                onError={this.onError}
                                LoadingComponent={Loading}
                                ErrorComponent={Error}
                                config={config}
                            />
                        </div>
                        <div className="graph graph-column s-dynamic-measures-column-chart">
                            <ColumnChart
                                projectId={projectId}
                                afm={columnChartAfm}
                                onLoadingChanged={this.onLoadingChanged}
                                onError={this.onError}
                                LoadingComponent={Loading}
                                ErrorComponent={Error}
                                config={config}
                            />
                        </div>
                    </div>
                );
            } else {
                content = <Error error={{ status: '400', message: 'Please select at least one measure' }} />;
            }
        }

        return (
            <div className="s-dynamic-measures">
                <hr className="separator" />
                <Layout sidebar={sidebar} >
                    {content}
                </Layout>
                <hr className="separator" />
            </div>
        );
    }
}

export default DynamicMeasuresExample;
