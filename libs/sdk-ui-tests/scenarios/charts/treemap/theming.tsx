// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";
import { TreemapWithMeasureViewByAndSegmentBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", TreemapWithMeasureViewByAndSegmentBy);
