// (C) 2019-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { featureFlagsRequest, setFeatureFlagsItems } from "../actions/featureFlags_actions.js";
import { getUserProjectConfigs as apiGetUserProjectConfigs } from "../utils/api.js";

import { watchFeatureFlags } from "./featureFlags_sagas.js";

describe("Configs", () => {
    it("should update configs", () => {
        const projectId = "project_id";
        const userId = "user_id";

        const settings: IUserWorkspaceSettings = {
            userId,
            locale: "en-US",
            workspace: projectId,
            config1: "false",
            config2: "true",
            separators: {
                decimal: ".",
                thousand: ",",
            },
        };

        const saga = expectSaga(watchFeatureFlags);

        return saga
            .provide([[call(apiGetUserProjectConfigs, projectId), settings]])
            .put(setFeatureFlagsItems(settings))
            .dispatch(featureFlagsRequest(projectId))
            .silentRun();
    });
});
