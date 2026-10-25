// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IInsight, type IWorkspacePermissions, idRef, newInsightDefinition } from "@gooddata/sdk-model";

import {
    getCurrentProjectInfo,
    hasWorkspaceAccess,
    stashedProjectUri,
} from "../../selectors/bootstrap_selector.js";
import { enableVisualizationPermissions } from "../../selectors/feature_flag_selector.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { workspacePermissions } from "../../selectors/permissions_selector.js";
import { getRouteParams } from "../../utils/location.js";
import { getInsight } from "../open_report_sagas.js";

import { CREATE_REPORT_DENIED_ERROR, verifyUserAccess } from "./verifyUserAccess.js";

const routeParams = { projectId: "ws1", reportId: "insight-1" };
const projectInfo = { identifier: "ws1", uri: "/ws1", title: "Workspace" };

const permissions = (overrides: Partial<IWorkspacePermissions>): IWorkspacePermissions =>
    ({
        canAccessWorkbench: true,
        canAnalyzeWorkspace: false,
        canCreateVisualization: false,
        canCreateComputedAttribute: false,
        canManageProject: false,
        ...overrides,
    }) as IWorkspacePermissions;

const insightWith = (insightPermissions: IInsight["insight"]["permissions"]): IInsight => ({
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        permissions: insightPermissions,
    },
});

function run(
    workspacePermissionsValue: IWorkspacePermissions,
    isEmbedded: boolean,
    flag: boolean,
    insight?: IInsight | Error,
) {
    return expectSaga(verifyUserAccess)
        .provide([
            [select(getRouteParams), routeParams],
            [select(getCurrentProjectInfo), projectInfo],
            [select(hasWorkspaceAccess), true],
            [select(workspacePermissions), workspacePermissionsValue],
            [select(getIsEmbedded), isEmbedded],
            [select(stashedProjectUri), undefined],
            [select(enableVisualizationPermissions), flag],
            [
                call(getInsight, routeParams.projectId, routeParams.reportId),
                insight instanceof Error ? throwError(insight) : { insight },
            ],
        ])
        .run();
}

describe("verifyUserAccess", () => {
    it("lets the ANALYZE role in anywhere", async () => {
        await run(permissions({ canAnalyzeWorkspace: true }), false, true);
    });

    it("lets a create-holder into the embedded editor", async () => {
        await run(permissions({ canCreateVisualization: true }), true, false);
    });

    it("keeps a create-holder out of the standalone editor", async () => {
        await expect(run(permissions({ canCreateVisualization: true }), false, true)).rejects.toEqual(
            CREATE_REPORT_DENIED_ERROR,
        );
    });

    it("lets a user holding EDIT on the opened visualization into the embedded editor", async () => {
        await run(permissions({}), true, true, insightWith(["EDIT", "VIEW"]));
    });

    it("keeps a user without EDIT on the opened visualization out", async () => {
        await expect(run(permissions({}), true, true, insightWith(["VIEW"]))).rejects.toEqual(
            CREATE_REPORT_DENIED_ERROR,
        );
    });

    it("keeps the door shut when the visualization cannot be read", async () => {
        await expect(run(permissions({}), true, true, new Error("404"))).rejects.toEqual(
            CREATE_REPORT_DENIED_ERROR,
        );
    });

    it("ignores the visualization's EDIT while the flag is off", async () => {
        await expect(run(permissions({}), true, false, insightWith(["EDIT"]))).rejects.toEqual(
            CREATE_REPORT_DENIED_ERROR,
        );
    });

    it("ignores the visualization's EDIT in the standalone editor", async () => {
        await expect(run(permissions({}), false, true, insightWith(["EDIT"]))).rejects.toEqual(
            CREATE_REPORT_DENIED_ERROR,
        );
    });
});
