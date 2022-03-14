// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import Measure from "react-measure";

import * as Md from "../../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

interface IResponsiveExampleState {
    size: [number, number];
}

export const ResponsiveExample: React.FC = () => {
    const [
        {
            size: [width, height],
        },
        setState,
    ] = useState<IResponsiveExampleState>({ size: [500, 400] });

    const resize = (size: [number, number]) => setState({ size });

    return (
        <div>
            <button onClick={() => resize([500, 400])} className="gd-button gd-button-secondary">
                500x400
            </button>
            <button
                onClick={() => resize([800, 200])}
                className="gd-button gd-button-secondary s-resize-800x200"
            >
                800x200
            </button>

            <hr className="separator" />

            <div style={{ width, height }} className="s-resizable-vis">
                <Measure client>
                    {({ measureRef, contentRect }) => {
                        const usedHeight =
                            contentRect.client && contentRect.client.height
                                ? Math.floor(contentRect.client.height)
                                : 0;
                        return (
                            <div style={{ width: "100%", height: "100%" }} ref={measureRef}>
                                <BarChart
                                    height={usedHeight}
                                    measures={[TotalSales]}
                                    viewBy={Md.LocationResort}
                                    stackBy={Md.DateDatasets.Date.Month.Short}
                                />
                            </div>
                        );
                    }}
                </Measure>
            </div>
        </div>
    );
};
