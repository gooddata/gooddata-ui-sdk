// (C) 2021-2025 GoodData Corporation
import React from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects as TigerMDObjects;

export function HeaderLocalizationScenario() {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.HeaderTests)} config={{ locale: "fr-FR" }} />;
}
