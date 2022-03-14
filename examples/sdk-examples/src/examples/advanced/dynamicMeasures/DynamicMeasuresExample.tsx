// (C) 2007-2022 GoodData Corporation
import React, { useState, useEffect } from "react";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { LineChart, ColumnChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { newMeasure } from "@gooddata/sdk-model";

import sdk from "@gooddata/api-client-bear";

import { Layout } from "../../../components/Layout";
import { SidebarItem } from "../../../components/SidebarItem";
import { workspace } from "../../../constants/fixtures";
import * as Md from "../../../md/full";

const franchiseFeesTag = "franchise_fees";

interface IDynamicMeasuresExampleState {
    measureList: null | any[];
    error: null | {
        message: string;
        description: string;
    };
}

const getNewMeasureDefinition = (measureItem: any) => {
    return newMeasure(measureItem.identifier, (m) => m.format("#,##0"));
};

const getMeasureListByTag = async (tag: string) => {
    const result = await sdk.xhr.get(`/gdc/md/${workspace}/tags/${tag}`);
    const items = result.data.entries;
    const measureItems = items.filter((item: any) => item.category === "metric");
    const measures = await Promise.all(measureItems.map((measure: any) => sdk.xhr.get(measure.link)));
    return measures.map((measure: any) => measure.data.metric.meta);
};

const config: IChartConfig = { legend: { position: "bottom" } };

export const DynamicMeasuresExample: React.FC = () => {
    const [{ measureList, error }, setState] = useState<IDynamicMeasuresExampleState>({
        measureList: null,
        error: null,
    });

    useEffect(() => {
        getMeasureListByTag(franchiseFeesTag)
            .then((measures) => {
                const updatedState = measures.length
                    ? {
                          measureList: measures.map((entry) => ({
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
            .catch((error) => {
                setState({
                    measureList: null,
                    error: {
                        message: `There was Error while requesting measures by tag ${franchiseFeesTag}`,
                        description: JSON.stringify(error),
                    },
                });
            });
    }, []);

    const onMeasureChange = (measureIdentifier: string) => {
        const updatedMeasure = measureList!.find((measure) => measure.identifier === measureIdentifier);
        const updatedMeasureIndex = measureList!.indexOf(updatedMeasure);
        const updatedMeasures = [...measureList!];
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
                {measureList.map(({ title, identifier, isSelected }) => (
                    <SidebarItem
                        key={identifier}
                        label={title}
                        id={identifier}
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
        const selectedMeasures = measureList.filter((measure) => measure.isSelected);
        const measures = selectedMeasures.map(getNewMeasureDefinition);

        if (selectedMeasures.length) {
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
                            measures={measures}
                            trendBy={Md.DateDatasets.Date.Month.Short}
                            config={config}
                        />
                    </div>
                    <div className="graph graph-column s-dynamic-measures-column-chart">
                        <ColumnChart measures={measures} config={config} />
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
