// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { HeaderPredicates, ExplicitDrill, IDrillEvent } from "@gooddata/sdk-ui";
import { storiesOf } from "../../_infra/storyRepository";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";
import {
    attributeIdentifier,
    attributeLocalId,
    measureIdentifier,
    measureLocalId,
} from "@gooddata/sdk-model";

const backend = StorybookBackend();
const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const viewBy = [ReferenceMd.Product.Name, ReferenceMd.Region];

const BarChartDrilling: React.FC<{ drillableItems: ExplicitDrill[] }> = ({ drillableItems }) => {
    const [lastEvent, setLastEvent] = useState<IDrillEvent | null>(null);

    return (
        <div className="s-visualization-chart">
            <BarChart
                backend={backend}
                workspace={ReferenceWorkspaceId}
                measures={measures}
                viewBy={viewBy}
                onDrill={setLastEvent}
                drillableItems={drillableItems}
            />

            <pre className="s-last-event" style={{ marginTop: 400 }}>
                {JSON.stringify(lastEvent?.drillContext, null, 2) ?? "null"}
            </pre>
        </div>
    );
};

storiesOf(`${StoriesForEndToEndTests}/Drilling`)
    .add("bar chart with localId measure drilling", () => (
        <BarChartDrilling
            drillableItems={[HeaderPredicates.localIdentifierMatch(measureLocalId(ReferenceMd.Amount))]}
        />
    ))
    .add("bar chart with identifier measure drilling", () => (
        <BarChartDrilling
            drillableItems={[HeaderPredicates.identifierMatch(measureIdentifier(ReferenceMd.Amount)!)]}
        />
    ))
    .add("bar chart with localId attribute drilling", () => (
        <BarChartDrilling
            drillableItems={[
                HeaderPredicates.localIdentifierMatch(attributeLocalId(ReferenceMd.Product.Name)),
            ]}
        />
    ))
    .add("bar chart with identifier attribute drilling", () => (
        <BarChartDrilling
            drillableItems={[
                HeaderPredicates.identifierMatch(attributeIdentifier(ReferenceMd.Product.Name)!),
            ]}
        />
    ));
