// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { TABLE } from "../constants/visualization_types.js";
import {
    columnVisualizationClass,
    headlineVisualizationClass,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";

import {
    findVisualizationClass,
    getDefaultVisualizationClass,
    isVisualizationClassDeprecated,
    isVisualizationClassLocal,
    isVisualizationClassSupported,
    unwrapVisualizationClass,
} from "./visualization_class.js";

describe("VisualizationClass", () => {
    describe("findVisualizationClass", () => {
        it("should return null when VisualizationClass list is null", () => {
            const visualizationClass = findVisualizationClass(null, TABLE);
            expect(visualizationClass).toBe(null);
        });

        it("should return null when VisualizationClass list is undefined", () => {
            const visualizationClass = findVisualizationClass(undefined, TABLE);
            expect(visualizationClass).toBe(null);
        });

        it("should return null when VisualizationClass list is empty", () => {
            const visualizationClass = findVisualizationClass([], TABLE);
            expect(visualizationClass).toBe(null);
        });

        it("should return null when Table VisualizationClass list is NOT found", () => {
            const visualizationClass = findVisualizationClass([headlineVisualizationClass], TABLE);
            expect(visualizationClass).toBe(null);
        });

        it("should return object when Table VisualizationClass list is found", () => {
            const visualizationClass = findVisualizationClass(
                [headlineVisualizationClass, tableVisualizationClass],
                TABLE,
            );
            expect(visualizationClass).toEqual(tableVisualizationClass);
        });
    });

    describe("isVisualizationClassDeprecated", () => {
        it("should return false when visualization class is NOT deprecated", () => {
            const isDeprecated = isVisualizationClassDeprecated(tableVisualizationClass);
            expect(isDeprecated).toBe(false);
        });

        it("should return true when visualization class is undefined", () => {
            const isDeprecated = isVisualizationClassDeprecated(undefined);
            expect(isDeprecated).toBe(true);
        });

        it("should return true when visualization class is null", () => {
            const isDeprecated = isVisualizationClassDeprecated(null);
            expect(isDeprecated).toBe(true);
        });
    });

    describe("isVisualizationClassLocal", () => {
        it("should return true when visualization class is local GDC", () => {
            const isLocal = isVisualizationClassLocal(tableVisualizationClass);
            expect(isLocal).toBe(true);
        });

        it("should return false when visualization class is NOT local GDC", () => {
            const customVisualizationClass: IVisualizationClass = {
                visualizationClass: {
                    url: "notLocalVisualization",
                    icon: "icon",
                    iconSelected: "iconSelected",
                    checksum: "checksum",
                    title: "Table",
                    identifier: "not_local",
                    uri: "/gdc/md/foo",
                    orderIndex: 5,
                },
            };

            const isLocal = isVisualizationClassLocal(customVisualizationClass);
            expect(isLocal).toBe(false);
        });

        it("should return false when visualization class is undefined", () => {
            const isLocal = isVisualizationClassLocal(undefined);
            expect(isLocal).toBe(false);
        });

        it("should return false when visualization class is null", () => {
            const isLocal = isVisualizationClassLocal(null);
            expect(isLocal).toBe(false);
        });
    });

    describe("isVisualizationClassSupported", () => {
        it("should return true when visualization class is local and supported", () => {
            const isSupported = isVisualizationClassSupported(tableVisualizationClass);
            expect(isSupported).toBe(true);
        });

        it("should return false when visualization class is local and NOT supported", () => {
            const unsupportedVisClass: IVisualizationClass = {
                visualizationClass: {
                    url: "local:NewVisualization",
                    icon: "icon",
                    iconSelected: "iconSelected",
                    checksum: "checksum",
                    title: "Table",
                    identifier: "not_local",
                    uri: "/gdc/md/foo",
                    orderIndex: 5,
                },
            };

            const isSupported = isVisualizationClassSupported(unsupportedVisClass);
            expect(isSupported).toBe(false);
        });
    });

    describe("getDefaultVisualizationClass", () => {
        it("should return column class as default", () => {
            const visualizationClasses = [
                tableVisualizationClass,
                columnVisualizationClass,
                headlineVisualizationClass,
            ];

            const defaultVisualizationClass = getDefaultVisualizationClass(visualizationClasses);
            expect(defaultVisualizationClass).toEqual(columnVisualizationClass);
        });

        it("should return table class as default", () => {
            const visualizationClasses = [headlineVisualizationClass, tableVisualizationClass];

            const defaultVisualizationClass = getDefaultVisualizationClass(visualizationClasses);
            expect(defaultVisualizationClass).toEqual(tableVisualizationClass);
        });

        it("should return first class from the list as default", () => {
            const visualizationClasses = [headlineVisualizationClass];

            const defaultVisualizationClass = getDefaultVisualizationClass(visualizationClasses);
            expect(defaultVisualizationClass).toEqual(headlineVisualizationClass);
        });

        it("should return null when input is empty array", () => {
            const defaultVisualizationClass = getDefaultVisualizationClass([]);
            expect(defaultVisualizationClass).toBe(null);
        });

        it("should return null when input is undefined", () => {
            const defaultVisualizationClass = getDefaultVisualizationClass(undefined);
            expect(defaultVisualizationClass).toBe(null);
        });

        it("should return null when input in null", () => {
            const defaultVisualizationClass = getDefaultVisualizationClass(null);
            expect(defaultVisualizationClass).toBe(null);
        });

        it("should return table class when column is NOT supported", () => {
            const unsupportedLocalVisClass: IVisualizationClass = {
                visualizationClass: {
                    url: "local:NewVisualization",
                    icon: "icon",
                    iconSelected: "iconSelected",
                    checksum: "checksum",
                    title: "newVisualizationClass",
                    identifier: "not_local",
                    uri: "/gdc/md/foo",
                    orderIndex: 5,
                },
            };

            const visualizationClasses = [
                unsupportedLocalVisClass,
                headlineVisualizationClass,
                tableVisualizationClass,
            ];

            const defaultVisualizationClass = getDefaultVisualizationClass(visualizationClasses);
            expect(defaultVisualizationClass).toEqual(tableVisualizationClass);
        });
    });

    describe("unwrapVisualizationClass", () => {
        it("should return unwrapped VisualizationClass object", () => {
            const visualizationClass: IVisualizationClass = tableVisualizationClass;

            const visualizationClassWrapped = {
                visualizationClass,
            };

            const visualizationClassResult = unwrapVisualizationClass(visualizationClassWrapped);
            expect(visualizationClassResult).toEqual(visualizationClass);
        });

        it("should return null when VisualizationClass object is undefined", () => {
            const visualizationClassResult = unwrapVisualizationClass(undefined);
            expect(visualizationClassResult).toEqual(null);
        });

        it("should return null when VisualizationClass object is null", () => {
            const visualizationClassResult = unwrapVisualizationClass(null);
            expect(visualizationClassResult).toEqual(null);
        });
    });
});
