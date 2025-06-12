// (C) 2021 GoodData Corporation
import React from "react";
import { defaultImport } from "default-import";
import * as Highcharts from "highcharts";
import DefaultHighchartSankey from "highcharts/modules/sankey.js";
import DefaultHighchartsWheel from "highcharts/modules/dependency-wheel.js";
import DefaultHighchartsReact from "highcharts-react-official";
import { WithLoadingResult } from "@gooddata/sdk-ui";
import { IMeasure, IMeasureDefinition, isResultAttributeHeader } from "@gooddata/sdk-model";

const HighchartSankey = defaultImport(DefaultHighchartSankey);
const HighchartsWheel = defaultImport(DefaultHighchartsWheel);
const HighchartsReact = defaultImport(DefaultHighchartsReact);

HighchartSankey(Highcharts);
HighchartsWheel(Highcharts);

export interface ICustomVisualization {
    measure: IMeasure<IMeasureDefinition>;
}

export const CustomVisualization: React.FC<ICustomVisualization & WithLoadingResult> = (props) => {
    const { error, isLoading, result, measure } = props;
    if (isLoading) {
        return <span>Loading…</span>;
    }

    if (error) {
        return <span>Something went wrong :-(</span>;
    }

    if (result) {
        const data = result
            .data()
            .series()
            .firstForMeasure(measure)
            .dataPoints()
            .map((dataPoint) => {
                const header1 = dataPoint.sliceDesc?.headers[0];
                const header2 = dataPoint.sliceDesc?.headers[1];

                if (isResultAttributeHeader(header1) && isResultAttributeHeader(header2)) {
                    return {
                        from: header1.attributeHeaderItem.name,
                        to: header2.attributeHeaderItem.name,
                        weight: Number(dataPoint.rawValue),
                    };
                }

                return undefined;
            });

        return (
            <HighchartsReact
                highcharts={Highcharts}
                options={{
                    chart: {
                        type: "dependencywheel",
                    },
                    title: {
                        text: "🎉 Custom Chart Built with Highcharts 🎉",
                    },
                    series: [
                        {
                            data,
                        },
                    ],
                }}
            />
        );
    }

    return <span>Init…</span>;
};
