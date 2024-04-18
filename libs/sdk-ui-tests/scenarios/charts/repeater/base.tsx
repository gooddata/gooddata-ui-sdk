// (C) 2024 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { IAttribute, IMeasure, isAttribute, modifyMeasure } from "@gooddata/sdk-model";
import { Repeater, IRepeaterProps, ChartInlineVisualizationType } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import cloneDeep from "lodash/cloneDeep.js";

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
export default scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 800 } })
    .addScenario("one attribute", RepeaterWithOneAttribute)
    .addScenario("one attribute and one measure", RepeaterWithOneAttributeAndMeasure)
    .addScenario("one attribute and one visualisation", RepeaterWithOneAttributeAndInlineVisualisation);
