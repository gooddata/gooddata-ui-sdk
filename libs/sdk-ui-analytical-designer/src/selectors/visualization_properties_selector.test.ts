// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { propertiesMetaInitialState } from "../store/properties/properties_meta_state.js";
import { propertiesInitialState } from "../store/properties/properties_state.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { VisualizationPropertiesSelectors } from "./visualization_properties_selector.js";

describe("propertiesSelector", () => {
    it("should return visualization properties", () => {
        const properties = { foo: "bar" };
        expect(
            VisualizationPropertiesSelectors.getProperties(
                withData(initialState, { visualizationProperties: properties }),
            ),
        ).toEqual(properties);
    });

    it("should return properties meta values as plain data", () => {
        expect(
            VisualizationPropertiesSelectors.getPropertiesMeta(
                withData(initialState, { propertiesMeta: { foo: "bar" } }),
            ),
        ).toEqual({ foo: "bar" });

        expect(
            VisualizationPropertiesSelectors.getPropertiesMeta(
                withData(initialState, { propertiesMeta: { foo: "bar" } }),
            ),
        ).toEqual({ foo: "bar" });
    });

    it("should fall back to the slices' initial state on the pristine state", () => {
        expect(VisualizationPropertiesSelectors.getProperties(initialState)).toBe(propertiesInitialState);
        expect(VisualizationPropertiesSelectors.getPropertiesMeta(initialState)).toBe(
            propertiesMetaInitialState,
        );
    });
});
