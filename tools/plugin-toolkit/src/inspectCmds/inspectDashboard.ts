// (C) 2021-2025 GoodData Corporation
/* eslint-disable no-console */
import columnify from "columnify";
import isEmpty from "lodash/isEmpty.js";

import { areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { InspectCmdActionConfig } from "./actionConfig.js";
import { printObjectSummary } from "./output.js";
import { ActionOptions } from "../_base/types.js";

export async function inspectDashboard(
    config: InspectCmdActionConfig,
    _options: ActionOptions,
): Promise<void> {
    const { backendInstance, workspace, identifier } = config;
    const ref = idRef(identifier, "analyticalDashboard");
    const {
        dashboard,
        references: { plugins },
    } = await backendInstance
        .workspace(workspace)
        .dashboards()
        .getDashboardWithReferences(ref, undefined, undefined, ["dashboardPlugin"]);
    const { title, description, tags, updated, created } = dashboard;

    printObjectSummary({
        type: "Dashboard",
        identifier,
        title,
        description,
        tags,
        updated,
        created,
    });

    if (isEmpty(plugins)) {
        console.log("Dashboard is not linked with any plugins.");
    } else {
        console.log("\nLinked dashboard plugins\n");
        console.log(
            columnify(
                plugins.map((plugin) => {
                    const link = dashboard.plugins?.find((link) => {
                        return areObjRefsEqual(link.plugin, plugin.ref);
                    });

                    return {
                        identifier: plugin.identifier,
                        title: plugin.name,
                        url: plugin.url,
                        parameters: !isEmpty(link?.parameters) ? link!.parameters : "(none)",
                        created: plugin.created,
                        updated: plugin.updated,
                    };
                }),
            ),
        );
    }
}
