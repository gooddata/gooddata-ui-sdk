// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newAttributeSort } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const BulletChartWithAllMeasuresAndViewBy = {
    primaryMeasure: ReferenceLdm.Won,
    targetMeasure: ReferenceLdm.Amount,
    comparativeMeasure: ReferenceLdmExt.CalculatedLost,
    viewBy: [ReferenceLdm.Product.Name],
};

export const BulletChartWithAllMeasuresAndTwoViewBy = {
    primaryMeasure: ReferenceLdm.Won,
    targetMeasure: ReferenceLdm.Amount,
    comparativeMeasure: ReferenceLdmExt.CalculatedLost,
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
};

export default scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("primary measure", {
        primaryMeasure: ReferenceLdm.Won,
    })
    .addScenario("primary and target measures", {
        primaryMeasure: ReferenceLdm.Won,
        targetMeasure: ReferenceLdm.Amount,
    })
    .addScenario("primary and comparative measures", {
        primaryMeasure: ReferenceLdm.Won,
        comparativeMeasure: ReferenceLdm.Amount,
    })
    .addScenario("primary, target and comparative measures", {
        primaryMeasure: ReferenceLdm.Won,
        targetMeasure: ReferenceLdm.Amount,
        comparativeMeasure: ReferenceLdmExt.CalculatedLost,
    })
    .addScenario("primary and target measures with viewBy", {
        primaryMeasure: ReferenceLdm.Won,
        targetMeasure: ReferenceLdm.Amount,
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("primary, target and comparative measures with viewBy", BulletChartWithAllMeasuresAndViewBy)
    .addScenario("primary, target and comparative measures with viewBy and sort", {
        ...BulletChartWithAllMeasuresAndViewBy,
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name)],
    })
    .addScenario(
        "primary, target and comparative measures with two viewBy",
        BulletChartWithAllMeasuresAndTwoViewBy,
    );
