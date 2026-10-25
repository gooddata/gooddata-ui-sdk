// (C) 2007-2026 GoodData Corporation

import { type IBootstrapData } from "../../actions/app_context_actions.js";
import { initialState } from "../../reducers/initial_state.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";
import { type PartialRecursive } from "../../typings/type_utils.js";

export const MockTrackingData = {
    projectId: "/proj/1",
    loginMD5: "loginmd5",
    email: "bear@gooddata.com",
    organizationName: "gooddata",
    projectTemplate: "/goodsales/1",
};

const bootstrapData: PartialRecursive<IBootstrapData> = {
    user: {
        loginMD5: MockTrackingData.loginMD5,
        email: MockTrackingData.email,
    },
    project: {
        identifier: MockTrackingData.projectId,
        templateUrl: MockTrackingData.projectTemplate,
    },
    uiSettings: {
        organizationName: MockTrackingData.organizationName,
    },
};

export function MockTrackingState() {
    return withRoot(withRoot(initialState, { bootstrapData: bootstrapData as unknown as IBootstrapData }), {
        projectId: MockTrackingData.projectId,
    });
}
