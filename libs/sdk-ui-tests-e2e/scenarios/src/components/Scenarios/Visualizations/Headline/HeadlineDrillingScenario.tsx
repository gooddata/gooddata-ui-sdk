// (C) 2020-2022 GoodData Corporation

import React, { useEffect, useState } from "react";
import {
    IDrillEvent,
    ExplicitDrill,
    HeaderPredicates,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { Headline } from "@gooddata/sdk-ui-charts";
import { Won } from "../../../../md/full";
import { measureLocalId, measureIdentifier } from "@gooddata/sdk-model";

interface IHeadDrillingProps {
    drillableItems: ExplicitDrill[] | undefined;
}

const HeadlineDrilling: React.FC<IHeadDrillingProps> = (props) => {
    const { drillableItems } = props;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const [lastEvent, setLastEvent] = useState<IDrillEvent | null>(null);

    useEffect(() => {
        setLastEvent(null);
    }, [drillableItems]);

    return (
        <div className="s-visualization-chart">
            <Headline
                backend={backend}
                workspace={workspace}
                primaryMeasure={Won}
                onDrill={setLastEvent}
                drillableItems={drillableItems}
            />

            <pre className="s-last-event" style={{ marginTop: 100, fontSize: "12px" }}>
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
        drillableItems: [HeaderPredicates.localIdentifierMatch(measureLocalId(Won))],
    },
    {
        id: "identifier-measure-drilling",
        label: "identifier measure drilling",
        drillableItems: [HeaderPredicates.identifierMatch(measureIdentifier(Won)!)],
    },
];

export const HeadDrillingScenario: React.FC = () => {
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
                        className={`s-${ex.id}-button`}
                    >
                        {ex.label}
                    </button>
                );
            })}
            <div>
                <HeadlineDrilling drillableItems={currentDrillExample.drillableItems} />
            </div>
        </div>
    );
};
