// (C) 2024-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IAttribute, type IMeasure, isAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { type ChartInlineVisualizationType, type IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const cloneBucketItem = (item: IAttribute | IMeasure): IAttribute | IMeasure => {
    const clonedItem = cloneDeep(item);

    if (isAttribute(clonedItem)) {
        clonedItem.attribute.localIdentifier = clonedItem.attribute.localIdentifier + "_cloned";
    } else {
        clonedItem.measure.localIdentifier = clonedItem.measure.localIdentifier + "_cloned";
    }

    return clonedItem;
};

export const RepeaterWithOneAttribute = {
    attribute: ReferenceMd.City.Name,
    columns: [cloneBucketItem(ReferenceMd.City.Name)],
};
export const RepeaterWithOneAttributeAndMeasure = {
    attribute: ReferenceMd.City.Name,
    columns: [cloneBucketItem(ReferenceMd.City.Name), ReferenceMd.NrOfLostOpps],
};

const measureWithTitle = modifyMeasure(cloneBucketItem(ReferenceMd.NrOfLostOpps) as IMeasure, (m) =>
    m.title("# of Lost Opps."),
);

export const RepeaterWithOneAttributeAndInlineVisualisation = {
    attribute: ReferenceMd.City.Name,
    columns: [cloneBucketItem(ReferenceMd.City.Name), measureWithTitle, ReferenceMd.NrOfLostOpps],
    viewBy: ReferenceMd.Product.Default,
    config: {
        inlineVisualizations: {
            [ReferenceMd.NrOfLostOpps.measure.localIdentifier]: {
                type: "column" as ChartInlineVisualizationType,
            },
        },
    },
};
export const base = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        screenshotSize: { width: 800, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("one attribute", RepeaterWithOneAttribute)
    .addScenario("one attribute and one measure", RepeaterWithOneAttributeAndMeasure)
    .addScenario("one attribute and one visualisation", RepeaterWithOneAttributeAndInlineVisualisation);
