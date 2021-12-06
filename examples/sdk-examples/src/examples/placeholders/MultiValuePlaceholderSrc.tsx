// (C) 2007-2019 GoodData Corporation
import React from "react";
import xor from "lodash/xor";
import { PlaceholdersProvider, newPlaceholder } from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { IMeasure, measureIdentifier, measureTitle, modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const totalSalesProfit = modifyMeasure(Md.$TotalSales, (m) => m.title("Total sales"));
const grossProfit = modifyMeasure(Md.$GrossProfit, (m) => m.title("Gross profit"));
const allMeasures = [totalSalesProfit, grossProfit];

// Create new placeholder with default value
const measuresPlaceholder = newPlaceholder<IMeasure[]>(allMeasures);

const style = { height: 300 };
const BarChartWithPlaceholder: React.FC = () => {
    const [measures] = measuresPlaceholder.use();
    const measuresCount = measures?.length ?? 0;
    return (
        <div style={style}>
            {measuresCount < 1 ? (
                <h4>Please select at least one measure.</h4>
            ) : (
                <BarChart
                    // You can provide placeholder instead of the actual measures to any chart.
                    // Note that when the placeholder is holding multiple values, its values are flattened during the resolution.
                    measures={[measuresPlaceholder]}
                />
            )}
        </div>
    );
};

const MeasuresSelect: React.FC = () => {
    // Getting and setting placeholder value is very similar to usage of useState hook
    const [measures, setMeasures] = measuresPlaceholder.use();

    return (
        <div>
            <h3>Select measures:</h3>
            {allMeasures.map((measure) => {
                const id = measureIdentifier(measure);
                const isActive = measures && measures.some((m) => id === measureIdentifier(m));
                return (
                    <button
                        key={id}
                        onClick={() => setMeasures((currentMeasures) => xor(currentMeasures, [measure]))}
                        style={{ fontWeight: isActive ? "bold" : "normal" }}
                    >
                        {measureTitle(measure)}
                    </button>
                );
            })}
        </div>
    );
};

const MultiValuePlaceholderExample: React.FC = () => {
    return (
        // Wrap your app in PlaceholdersProvider
        <PlaceholdersProvider>
            <MeasuresSelect />
            <BarChartWithPlaceholder />
        </PlaceholdersProvider>
    );
};

export default MultiValuePlaceholderExample;
