// (C) 2021-2025 GoodData Corporation

import { defaultImport } from "default-import";
import * as Highcharts from "highcharts";
import DefaultHighchartsWheel from "highcharts/modules/dependency-wheel.js";
import DefaultHighchartSankey from "highcharts/modules/sankey.js";
import DefaultHighchartsReact from "highcharts-react-official";

import { IMeasure, IMeasureDefinition, isResultAttributeHeader } from "@gooddata/sdk-model";
import { WithLoadingResult } from "@gooddata/sdk-ui";

const HighchartSankey = defaultImport(DefaultHighchartSankey);
const HighchartsWheel = defaultImport(DefaultHighchartsWheel);
const HighchartsReact = defaultImport(DefaultHighchartsReact);

HighchartSankey(Highcharts);
HighchartsWheel(Highcharts);

export interface ICustomVisualization {
    measure: IMeasure<IMeasureDefinition>;
}

export function CustomVisualization(props: ICustomVisualization & WithLoadingResult) {
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
}
