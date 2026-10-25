// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { type IVisualizationClassesState } from "../store/visualization_classes/visualization_classes_state.js";

import { reportMessageSelector } from "./report_message_selector.js";

describe("reportMessageSelector", () => {
    describe("visualizationClasses", () => {
        it("should return empty array when no class is set in the state", () => {
            const result = reportMessageSelector(initialState);
            expect(result).toEqual({
                visualizationClasses: [],
            });
        });

        it("should return visualization class from the state", () => {
            // the sdk-model shape the API loader stores verbatim
            const visualizationClasses: IVisualizationClassesState = [
                {
                    visualizationClass: {
                        uri: "/gdc/md/v1",
                        identifier: "table",
                        title: "Table",
                        url: "local:table",
                        icon: "",
                        iconSelected: "",
                        checksum: "",
                    },
                },
                {
                    visualizationClass: {
                        uri: "/gdc/md/v2",
                        identifier: "column",
                        title: "Column",
                        url: "local:column",
                        icon: "",
                        iconSelected: "",
                        checksum: "",
                    },
                },
            ];
            const result = reportMessageSelector({
                ...initialState,
                data: { ...initialState.data, visualizationClasses },
            });

            expect(result).toEqual({
                visualizationClasses,
            });
        });
    });
});
