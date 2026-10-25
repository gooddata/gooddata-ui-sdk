// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { setTimezoneOverride } from "../actions/timezone_override_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";

import { getExecutionConfig } from "./execution_config_selector.js";

const parameterFilter: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p1",
    parameterRef: idRef("threshold", "parameter"),
    name: "Threshold",
    value: 25,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const parameterAtDefault: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p2",
    parameterRef: idRef("markup", "parameter"),
    name: "Markup",
    value: 0.15,
    definition: { type: "NUMBER", defaultValue: 0.15 },
};

const parameterViolatingConstraints: IParameterFilter = {
    type: "parameter",
    localIdentifier: "p3",
    parameterRef: idRef("scenario", "parameter"),
    name: "Scenario",
    value: "Optimistic",
    definition: { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 6 } },
};

describe("getExecutionConfig with parameters", () => {
    it("should include parameterValues from state parameter filters", () => {
        const state = withData(withRoot(initialState, { featureFlags: {} }), {
            filterBar: {
                items: [],
                parameterItems: [parameterFilter],
                isMultiline: false,
                migratedAdditionalFilters: [],
                filterBarDropdownOpen: false,
                attributeFilterConfigs: {},
            },
        });

        const config = getExecutionConfig(state);

        expect(config.parameterValues).toEqual([{ ref: idRef("threshold", "parameter"), value: 25 }]);
    });

    it("should omit parameterValues when all parameter filters are at default (smart persistence)", () => {
        const state = withData(withRoot(initialState, { featureFlags: {} }), {
            filterBar: {
                items: [],
                parameterItems: [parameterAtDefault],
                isMultiline: false,
                migratedAdditionalFilters: [],
                filterBarDropdownOpen: false,
                attributeFilterConfigs: {},
            },
        });

        const config = getExecutionConfig(state);

        expect(config.parameterValues).toBeUndefined();
    });

    it("should not execute constraint-violating values (sanitized to default, backend falls back)", () => {
        const state = withData(withRoot(initialState, { featureFlags: {} }), {
            filterBar: {
                items: [],
                parameterItems: [parameterViolatingConstraints, parameterFilter],
                isMultiline: false,
                migratedAdditionalFilters: [],
                filterBarDropdownOpen: false,
                attributeFilterConfigs: {},
            },
        });

        const config = getExecutionConfig(state);

        expect(config.parameterValues).toEqual([{ ref: idRef("threshold", "parameter"), value: 25 }]);
    });

    it("should omit parameterValues when no parameter filters are present", () => {
        const config = getExecutionConfig(initialState);

        expect(config.parameterValues).toBeUndefined();
    });
});

describe("getExecutionConfig with timezone override", () => {
    it("should omit timezone when no override is set", () => {
        const state = withRoot(initialState, { featureFlags: { enableTimezoneChange: true } });

        expect(getExecutionConfig(state).timezone).toBeUndefined();
    });

    it("should omit timezone when the timezone change is disabled even with an override", () => {
        const state = withRoot(withRoot(initialState, { featureFlags: { enableTimezoneChange: false } }), {
            timezoneOverride: "Europe/Prague",
        });

        expect(getExecutionConfig(state).timezone).toBeUndefined();
    });

    it("should include timezone when the timezone change is enabled and an override is set", () => {
        let state = withRoot(initialState, { featureFlags: { enableTimezoneChange: true } });
        state = rootReducer(state, setTimezoneOverride("America/New_York"));

        expect(getExecutionConfig(state).timezone).toBe("America/New_York");
    });

    it("should clear timezone from execution config when the override is cleared", () => {
        let state = withRoot(withRoot(initialState, { featureFlags: { enableTimezoneChange: true } }), {
            timezoneOverride: "Europe/Prague",
        });
        state = rootReducer(state, setTimezoneOverride(undefined));

        expect(getExecutionConfig(state).timezone).toBeUndefined();
    });
});
