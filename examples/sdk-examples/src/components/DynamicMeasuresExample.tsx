// (C) 2007-2019 GoodData Corporation
import React, { useState, useEffect } from "react";
import { LineChart, ColumnChart, ErrorComponent, LoadingComponent, IChartConfig } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import sdk from "@gooddata/gd-bear-client";
import "@gooddata/sdk-ui/styles/css/main.css";

import { Layout } from "./utils/Layout";
import { SidebarItem } from "./utils/SidebarItem";
import { monthDateIdentifier, projectId, franchiseFeesTag } from "../utils/fixtures";
import { useBackend } from "../backend";

interface IDynamicMeasuresExampleState {
    measureList: null | any[];
    error: null | {
        message: string;
        description: string;
    };
}

const getNewMeasureDefinition = (measureItem: any, index: number) => {
    return newMeasure(measureItem.link, m => m.format("#,##0").localId(`m${index}`));
};

const getMeasureListByTag = (tag: string) => sdk.xhr.get(`/gdc/md/${projectId}/tags/${franchiseFeesTag}`);

const config: IChartConfig = { legend: { position: "bottom" } };

export const DynamicMeasuresExample: React.FC = () => {
    const backend = useBackend();

    const [{ measureList, error }, setState] = useState<IDynamicMeasuresExampleState>({
        measureList: null,
        error: null,
    });

    useEffect(() => {
        getMeasureListByTag(franchiseFeesTag)
            .then(response => {
                const updatedState = response.data.entries.length
                    ? {
                          measureList: response.data.entries.map(entry => ({
                              ...entry,
                              isSelected: true,
                          })),
                          error: null,
                      }
                    : {
                          measureList: null,
                          error: {
                              message: `No measures with tag ${franchiseFeesTag}`,
                              description: `Please check your project. Franchise fees measures should have assigned the tag ${franchiseFeesTag}.`,
                          },
                      };

                setState(updatedState);
            })
            .catch(error => {
                setState({
                    measureList: null,
                    error: {
                        message: `There was Error while requesting measures by tag ${franchiseFeesTag}`,
                        description: JSON.stringify(error),
                    },
                });
            });
    }, []);

    const onMeasureChange = measureIdentifier => {
        const updatedMeasure = measureList.find(measure => measure.link === measureIdentifier);
        const updatedMeasureIndex = measureList.indexOf(updatedMeasure);
        const updatedMeasures = [...measureList];
        updatedMeasures[updatedMeasureIndex] = {
            ...updatedMeasure,
            isSelected: !updatedMeasure.isSelected,
        };

        setState({
            error: null,
            measureList: updatedMeasures,
        });
    };

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
                        onClick={onMeasureChange}
                    />
                ))}
            </ul>
        </div>
    ) : (
        loadingBlock
    );

    let content = loadingBlock;

    if (measureList) {
        const selectedMeasures = measureList.filter(measure => measure.isSelected);
        const measures = selectedMeasures.map(getNewMeasureDefinition);

        if (selectedMeasures.length) {
            const attribute = newAttribute(monthDateIdentifier);

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
                            backend={backend}
                            workspace={projectId}
                            measures={measures}
                            trendBy={attribute}
                            config={config}
                        />
                    </div>
                    <div className="graph graph-column s-dynamic-measures-column-chart">
                        <ColumnChart
                            backend={backend}
                            workspace={projectId}
                            measures={measures}
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
};
