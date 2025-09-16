// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { Execute, IExecuteProps, WithLoadingResult } from "@gooddata/sdk-ui";

import { scenariosFor } from "../../src/index.js";

function DumpingComponent(load: WithLoadingResult) {
    const dv = load.result;

    if (!dv) {
        return <div>No valid result. {load.error?.message}</div>;
    }

    const dataAccess = dv.data();

    return (
        <div>
            Series Count: ${dataAccess.series().count}
            Slices Count: ${dataAccess.slices().count}
        </div>
    );
}

export default scenariosFor<IExecuteProps>("Execute", Execute)
    .withDefaultTags("mock-no-insight")
    .withDefaultTestTypes("api")
    .addScenario("single unscoped series", {
        seriesBy: [ReferenceMd.Amount],
        children: DumpingComponent,
    })
    .addScenario("two unscoped series", {
        seriesBy: [ReferenceMd.Amount, ReferenceMd.Won],
        children: DumpingComponent,
    })
    .addScenario("scoped series", {
        seriesBy: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMd.Region.Default],
        children: DumpingComponent,
    })
    .addScenario("scoped series with slicing", {
        seriesBy: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMd.Region.Default],
        slicesBy: [ReferenceMd.Product.Name],
        children: DumpingComponent,
    });
