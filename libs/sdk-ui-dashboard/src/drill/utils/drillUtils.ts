// (C) 2019-2021 GoodData Corporation
import first from "lodash/first";
import last from "lodash/last";
import { getMappingHeaderLocalIdentifier, IDrillEvent } from "@gooddata/sdk-ui";
import { DrillDefinition, isMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { IDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import { DashboardDrillDefinition } from "../interfaces";
import { DrillConfigFactory } from "./DrillConfigFactory/DrillConfigFactory";

export function getDrillsBySourceLocalIdentifiers(
    widgetDrillDefinition: Array<DrillDefinition | IDrillDownDefinition>,
    drillSourceLocalIdentifiers: string[],
): Array<DrillDefinition | IDrillDownDefinition> {
    return widgetDrillDefinition.filter((d) =>
        drillSourceLocalIdentifiers.includes(DrillConfigFactory.Create(d).getFromLocalIdentifier()),
    );
}

export function getLocalIdentifiersFromEvent(drillEvent: IDrillEvent): string[] {
    const drillIntersection =
        (drillEvent && drillEvent.drillContext && drillEvent.drillContext.intersection) || [];
    return drillIntersection.map((x) => x.header).map(getMappingHeaderLocalIdentifier);
}

const getMeasureLocalIdentifier = (drillEvent: IDrillEvent): string =>
    first(
        ((drillEvent && drillEvent.drillContext.intersection) || [])
            .map((intersection) => intersection.header)
            .filter(isMeasureDescriptor)
            .map(getMappingHeaderLocalIdentifier),
    )!;

export function getDrillSourceLocalIdentifierFromEvent(drillEvent: IDrillEvent): string[] {
    const localIdentifiersFromEvent = getLocalIdentifiersFromEvent(drillEvent);

    if (drillEvent.drillContext.type === "table") {
        /*
        For tables, the event is always triggered on the individual column and there is no hierarchy involved.
        */
        const measureLocalIdentifier = getMeasureLocalIdentifier(drillEvent);

        return [measureLocalIdentifier ? measureLocalIdentifier : last(localIdentifiersFromEvent)!];
    }

    return localIdentifiersFromEvent;
}

export function filterDrillsByDrillEvent(
    drillDefinitions: DashboardDrillDefinition[],
    drillEvent: IDrillEvent,
): DashboardDrillDefinition[] {
    if (!drillDefinitions || !drillEvent) {
        return [];
    }
    const drillSourceLocalIdentifiers = getDrillSourceLocalIdentifierFromEvent(drillEvent);
    return getDrillsBySourceLocalIdentifiers(drillDefinitions, drillSourceLocalIdentifiers);
}
