// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { HeaderPredicates, IDrillableItem, IDrillEvent, IHeaderPredicate } from "@gooddata/sdk-ui";
import { storiesOf } from "@storybook/react";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";
import {
    attributeIdentifier,
    attributeLocalId,
    measureIdentifier,
    measureLocalId,
} from "@gooddata/sdk-model";

const backend = StorybookBackend();
const measures = [ReferenceLdm.Amount, ReferenceLdm.Won];
const viewBy = [ReferenceLdm.Product.Name, ReferenceLdm.Region];

const BarChartDrilling: React.FC<{ drillableItems: Array<IDrillableItem | IHeaderPredicate> }> = ({
    drillableItems,
}) => {
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

storiesOf(`${StoriesForEndToEndTests}/Drilling`, module)
    .add("bar chart with localId measure drilling", () => (
        <BarChartDrilling
            drillableItems={[HeaderPredicates.localIdentifierMatch(measureLocalId(ReferenceLdm.Amount))]}
        />
    ))
    .add("bar chart with identifier measure drilling", () => (
        <BarChartDrilling
            drillableItems={[HeaderPredicates.identifierMatch(measureIdentifier(ReferenceLdm.Amount)!)]}
        />
    ))
    .add("bar chart with localId attribute drilling", () => (
        <BarChartDrilling
            drillableItems={[
                HeaderPredicates.localIdentifierMatch(attributeLocalId(ReferenceLdm.Product.Name)),
            ]}
        />
    ))
    .add("bar chart with identifier attribute drilling", () => (
        <BarChartDrilling
            drillableItems={[
                HeaderPredicates.identifierMatch(attributeIdentifier(ReferenceLdm.Product.Name)!),
            ]}
        />
    ));
