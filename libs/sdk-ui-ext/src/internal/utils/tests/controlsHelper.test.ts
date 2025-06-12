// (C) 2019 GoodData Corporation
import { maxInputValidateAndPushData, minInputValidateAndPushData } from "../controlsHelper.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("controlsHelper", () => {
    describe("max/min input validation", () => {
        const basePath = "yAxis";
        const defaultState: any = {};
        function prepareData(value: string, maxmin: string) {
            return {
                properties: {
                    controls: {
                        [basePath]: {
                            [maxmin]: value,
                        },
                    },
                },
            };
        }

        describe("maxInputValidateAndPushData", () => {
            let setState: any;
            let pushData: any;
            let props: any;
            let state: any;

            beforeEach(() => {
                pushData = vi.fn();
                setState = vi.fn();
                props = {
                    properties: { controls: { yAxis: {} } },
                    pushData,
                    basePath,
                };

                state = {};
            });

            it("should report error if value is minus", () => {
                const data = prepareData("-", "max");
                maxInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(setState).toHaveBeenCalledWith({
                    maxScale: {
                        hasWarning: true,
                        incorrectValue: "-",
                        warningMessage: "",
                    },
                    minScale: {
                        hasWarning: false,
                    },
                });
            });

            it("should report error if minimum is greater than maximum", () => {
                state = {
                    minScale: {
                        incorrectValue: "40",
                    },
                };

                const data = prepareData("20", "max");
                maxInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(setState).toHaveBeenCalledWith({
                    maxScale: {
                        hasWarning: true,
                        incorrectValue: "20",
                        warningMessage: "properties.axis.max.warning",
                    },
                    minScale: {
                        hasWarning: false,
                        incorrectValue: "40",
                    },
                });
            });

            it("should pushData with properties when value is valid", () => {
                const data = prepareData("5", "max");
                maxInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(pushData).toHaveBeenCalledWith({
                    properties: { controls: { yAxis: { max: "5" } } },
                });
            });

            it("should pushData validated previous incorrect max/min when current value is valid", () => {
                state = {
                    minScale: {
                        incorrectValue: "40",
                    },
                };

                const data = prepareData("50", "max");
                maxInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(pushData).toHaveBeenCalledWith({
                    properties: { controls: { yAxis: { min: "40", max: "50" } } },
                });
            });
        });

        describe("minInputValidateAndPushData", () => {
            let setState: any;
            let pushData: any;
            let props: any;
            let state: any;

            beforeEach(() => {
                pushData = vi.fn();
                setState = vi.fn();
                props = {
                    properties: { controls: { yAxis: {} } },
                    pushData,
                    basePath,
                };

                state = {};
            });

            it("should report error if value is minus", () => {
                const data = prepareData("-", "min");
                minInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(setState).toHaveBeenCalledWith({
                    minScale: {
                        hasWarning: true,
                        incorrectValue: "-",
                        warningMessage: "",
                    },
                    maxScale: {
                        hasWarning: false,
                    },
                });
            });

            it("should report error if minimum is greater than maximum", () => {
                state = {
                    maxScale: {
                        incorrectValue: "20",
                    },
                };

                const data = prepareData("40", "min");
                minInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(setState).toHaveBeenCalledWith({
                    minScale: {
                        hasWarning: true,
                        incorrectValue: "40",
                        warningMessage: "properties.axis.min.warning",
                    },
                    maxScale: {
                        hasWarning: false,
                        incorrectValue: "20",
                    },
                });
            });

            it("should pushData with properties when value is valid", () => {
                const data = prepareData("5", "min");
                minInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(pushData).toHaveBeenCalledWith({
                    properties: { controls: { yAxis: { min: "5" } } },
                });
            });

            it("should pushData validated previous incorrect max/min when current value is valid", () => {
                state = {
                    maxScale: {
                        incorrectValue: "50",
                    },
                };

                const data = prepareData("40", "min");
                minInputValidateAndPushData(data, state, props, setState, defaultState);

                expect(pushData).toHaveBeenCalledWith({
                    properties: { controls: { yAxis: { min: "40", max: "50" } } },
                });
            });
        });
    });
});
