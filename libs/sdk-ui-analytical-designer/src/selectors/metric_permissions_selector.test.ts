// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { withRoot } from "../tests/state_builder.test.helpers.js";

import { canCreateMetric, effectiveWorkspacePermissions } from "./metric_permissions_selector.js";
import { Permissions } from "./permissions_selector.js";

interface IParameters {
    metricPermissionsEnabled: boolean;
    hasCreateMetric: boolean;
    hasManageProject: boolean;
}

const getState = ({ metricPermissionsEnabled, hasCreateMetric, hasManageProject }: IParameters) =>
    withRoot(
        withRoot(initialState, {
            workspacePermissions: {
                ...initialState.workspacePermissions,
                [Permissions.CAN_CREATE_METRIC]: hasCreateMetric,
                [Permissions.CAN_MANAGE_PROJECT]: hasManageProject,
            },
        }),
        { featureFlags: { enableMetricPermissions: metricPermissionsEnabled } },
    );

describe("canCreateMetric", () => {
    it.each`
        metricPermissionsEnabled | hasCreateMetric | hasManageProject | expected
        ${false}                 | ${false}        | ${true}          | ${true}
        ${false}                 | ${true}         | ${false}         | ${false}
        ${true}                  | ${true}         | ${false}         | ${true}
        ${true}                  | ${false}        | ${true}          | ${false}
    `(
        "is $expected with the flag $metricPermissionsEnabled, CREATE_METRIC $hasCreateMetric and MANAGE $hasManageProject",
        ({ expected, ...parameters }: IParameters & { expected: boolean }) => {
            expect(canCreateMetric(getState(parameters))).toBe(expected);
        },
    );
});

describe("effectiveWorkspacePermissions", () => {
    it("replaces the raw CREATE_METRIC permission with the resolved capability", () => {
        const state = getState({
            metricPermissionsEnabled: false,
            hasCreateMetric: false,
            hasManageProject: true,
        });

        expect(effectiveWorkspacePermissions(state)!.canCreateMetric).toBe(true);
    });
});
