// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { scenariosFor } from "../../src";
import { Execute, IExecuteProps, WithLoadingResult } from "@gooddata/sdk-ui";

const DumpingComponent = (load: WithLoadingResult) => {
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
};

export default scenariosFor<IExecuteProps>("Execute", Execute)
    .withDefaultTags("mock-no-insight")
    .withDefaultTestTypes("api")
    .addScenario("single unscoped series", {
        seriesBy: [ReferenceLdm.Amount],
        children: DumpingComponent,
    })
    .addScenario("two unscoped series", {
        seriesBy: [ReferenceLdm.Amount, ReferenceLdm.Won],
        children: DumpingComponent,
    })
    .addScenario("scoped series", {
        seriesBy: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdm.Region],
        children: DumpingComponent,
    })
    .addScenario("scoped series with slicing", {
        seriesBy: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdm.Region],
        slicesBy: [ReferenceLdm.Product.Name],
        children: DumpingComponent,
    });
