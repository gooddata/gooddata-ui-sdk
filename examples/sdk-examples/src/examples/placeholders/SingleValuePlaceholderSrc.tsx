// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PlaceholdersProvider, newPlaceholder } from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { IMeasure, measureIdentifier, measureTitle, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const totalSalesProfit = modifyMeasure(Md.$TotalSales, (m) => m.title("Total sales"));
const grossProfit = modifyMeasure(Md.$GrossProfit, (m) => m.title("Gross profit"));
const allMeasures = [totalSalesProfit, grossProfit];

// Create new placeholder with default value
const measurePlaceholder = newPlaceholder<IMeasure>(totalSalesProfit);

const style = { height: 300 };
const BarChartWithPlaceholder: React.FC = () => {
    return (
        <div style={style}>
            <BarChart
                // You can provide placeholder instead of the actual measure to any chart
                measures={[measurePlaceholder]}
            />
        </div>
    );
};

const MeasureSelect: React.FC = () => {
    // Getting and setting placeholder value is very similar to usage of useState hook
    const [measure, setMeasure] = measurePlaceholder.use();

    return (
        <div>
            <h3>Select measure:</h3>
            {allMeasures.map((m) => {
                const id = measureIdentifier(m);
                const isActive = measure && id === measureIdentifier(measure);
                return (
                    <button
                        key={id}
                        onClick={() => setMeasure(m)}
                        style={{ fontWeight: isActive ? "bold" : "normal" }}
                    >
                        {measureTitle(m)}
                    </button>
                );
            })}
        </div>
    );
};

const SingleValuePlaceholderExample: React.FC = () => {
    return (
        // Wrap your app in PlaceholdersProvider
        <PlaceholdersProvider>
            <MeasureSelect />
            <BarChartWithPlaceholder />
        </PlaceholdersProvider>
    );
};

export default SingleValuePlaceholderExample;
