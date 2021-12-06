// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PlaceholdersProvider, newPlaceholder, newComposedPlaceholder } from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    IMeasure,
    IMeasureDefinition,
    IMeasureFilter,
    measureIdentifier,
    measureTitle,
    modifySimpleMeasure,
    newAbsoluteDateFilter,
} from "@gooddata/sdk-model";
import { Md } from "../../md";

const totalSalesProfit = modifySimpleMeasure(Md.$TotalSales, (m) => m.title("Total sales"));
const grossProfit = modifySimpleMeasure(Md.$GrossProfit, (m) => m.title("Gross profit"));
const allMeasures = [totalSalesProfit, grossProfit];

const dateFilter2016 = newAbsoluteDateFilter(Md.DateDatasets.Date.ref, "2016-01-01", "2016-12-31");
const dateFilter2017 = newAbsoluteDateFilter(Md.DateDatasets.Date.ref, "2017-01-01", "2017-12-31");
const filtersWithTitles: [IMeasureFilter, string][] = [
    [dateFilter2016, "2016"],
    [dateFilter2017, "2017"],
];

const measurePlaceholder = newPlaceholder<IMeasure<IMeasureDefinition>>(totalSalesProfit);
const filterPlaceholder = newPlaceholder<IMeasureFilter>(dateFilter2016);

const composedMeasurePlaceholder = newComposedPlaceholder(
    [measurePlaceholder, filterPlaceholder],
    ([measure, filter]) => {
        // Compose measure from multiple placeholder values
        return modifySimpleMeasure(measure, (m) => m.filters(filter));
    },
);

const style = { height: 300 };
const BarChartWithPlaceholder: React.FC = () => {
    return (
        <div style={style}>
            <BarChart measures={[composedMeasurePlaceholder]} />
        </div>
    );
};

const MeasureSelect: React.FC = () => {
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

const FilterSelect: React.FC = () => {
    const [filter, setFilter] = filterPlaceholder.use();

    return (
        <div>
            <h3>Select filter:</h3>
            {filtersWithTitles.map(([f, title], i) => {
                const isActive = filter === f;
                return (
                    <button
                        key={i}
                        onClick={() => setFilter(f)}
                        style={{ fontWeight: isActive ? "bold" : "normal" }}
                    >
                        {title}
                    </button>
                );
            })}
        </div>
    );
};

const ComposedPlaceholderExample: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <MeasureSelect />
            <FilterSelect />
            <BarChartWithPlaceholder />
        </PlaceholdersProvider>
    );
};

export default ComposedPlaceholderExample;
