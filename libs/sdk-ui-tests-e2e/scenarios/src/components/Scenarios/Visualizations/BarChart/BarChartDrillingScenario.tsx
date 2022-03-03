// (C) 2020-2022 GoodData Corporation

import React, { useState } from "react";
import {
    IDrillEvent,
    ExplicitDrill,
    HeaderPredicates,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Amount, Won, Product, Region } from "../../../../md/full";
import {
    measureLocalId,
    measureIdentifier,
    attributeLocalId,
    attributeIdentifier,
} from "@gooddata/sdk-model";

interface IBarChartDrillingProps {
    drillableItems: ExplicitDrill[] | undefined;
}

const BarChartDrilling: React.FC<IBarChartDrillingProps> = (props) => {
    const { drillableItems } = props;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const [lastEvent, setLastEvent] = useState<IDrillEvent | null>(null);

    return (
        <div className="s-visualization-chart">
            <BarChart
                backend={backend}
                workspace={workspace}
                measures={[Amount, Won]}
                viewBy={[Product.Name, Region]}
                onDrill={setLastEvent}
                drillableItems={drillableItems}
            />

            <pre className="s-last-event" style={{ marginTop: 100 }}>
                {JSON.stringify(lastEvent?.drillContext, null, 2) ?? "null"}
            </pre>
        </div>
    );
};

interface DrillItems {
    id: string;
    label: string;
    drillableItems: ExplicitDrill[] | undefined;
}

const drillExamples: DrillItems[] = [
    {
        id: "localId-measure-drilling",
        label: "localId measure drilling",
        drillableItems: [HeaderPredicates.localIdentifierMatch(measureLocalId(Amount))],
    },
    {
        id: "identifier-measure-drilling",
        label: "identifier measure drilling",
        drillableItems: [HeaderPredicates.identifierMatch(measureIdentifier(Amount)!)],
    },
    {
        id: "localId-attribute-drilling",
        label: "localId attribute drilling",
        drillableItems: [HeaderPredicates.localIdentifierMatch(attributeLocalId(Product.Name))],
    },
    {
        id: "identifier-attribute-drilling",
        label: "identifier attribute drilling",
        drillableItems: [HeaderPredicates.identifierMatch(attributeIdentifier(Product.Name)!)],
    },
];

export const BarChartDrillingScenario: React.FC = () => {
    const [currentDrillExample, setCurrentDrillExample] = useState<DrillItems>(drillExamples[0]);

    return (
        <div>
            Current drillItems: {currentDrillExample.label}
            <br />
            {drillExamples.map((ex) => {
                return (
                    <button
                        key={ex.id}
                        onClick={() => {
                            setCurrentDrillExample(ex);
                        }}
                    >
                        {ex.label}
                    </button>
                );
            })}
            <div>
                <BarChartDrilling
                    key={`barchart-${currentDrillExample.id}`}
                    drillableItems={currentDrillExample.drillableItems}
                />
            </div>
        </div>
    );
};
