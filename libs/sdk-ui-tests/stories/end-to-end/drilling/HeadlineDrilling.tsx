// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Headline } from "@gooddata/sdk-ui-charts";
import { HeaderPredicates, IDrillableItem, IDrillEvent, IHeaderPredicate } from "@gooddata/sdk-ui";
import { storiesOf } from "@storybook/react";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";
import { measureIdentifier, measureLocalId } from "@gooddata/sdk-model";

const backend = StorybookBackend();

const HeadlineDrilling: React.FC<{ drillableItems: Array<IDrillableItem | IHeaderPredicate> }> = ({
    drillableItems,
}) => {
    const [lastEvent, setLastEvent] = useState<IDrillEvent | null>(null);

    return (
        <div className="s-headline">
            <Headline
                backend={backend}
                workspace={ReferenceWorkspaceId}
                primaryMeasure={ReferenceLdm.Won}
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
    .add("headline with localId measure drilling", () => (
        <HeadlineDrilling
            drillableItems={[HeaderPredicates.localIdentifierMatch(measureLocalId(ReferenceLdm.Won))]}
        />
    ))
    .add("headline with identifier measure drilling", () => (
        <HeadlineDrilling
            drillableItems={[HeaderPredicates.identifierMatch(measureIdentifier(ReferenceLdm.Won)!)]}
        />
    ));
