// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IDateFilterConfig, idRef } from "@gooddata/sdk-model";
import { suppressConsole } from "@gooddata/util";

import { absoluteForm, allTime, lastMonth, relativeForm, year2019 } from "./fixtures.js";
import { validateDateFilterConfig } from "../validation.js";

describe("validateDateFilterConfig", () => {
    it("should validate valid config", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldValidateValidConfig"),
            allTime,
            absoluteForm,
            absolutePresets: [year2019],
            relativeForm,
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("Valid");
    });

    it("should not validate config with no visible options", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotValidateConfigWithNoVisibleOptions"),
            allTime: {
                ...allTime,
                visible: false,
            },
            absoluteForm: {
                ...absoluteForm,
                visible: false,
            },
            absolutePresets: [
                {
                    ...year2019,
                    visible: false,
                },
            ],
            relativeForm: {
                ...relativeForm,
                visible: false,
            },
            relativePresets: [
                {
                    ...lastMonth,
                    visible: false,
                },
            ],
            selectedOption: allTime.localIdentifier,
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("NoVisibleOptions");
    });

    it("should not validate config with relative form with no granularities as the only visible option", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotValidateConfigWithRelativeFormWithNoGranularitiesAsTheOnlyVisibleOption"),
            allTime: {
                ...allTime,
                visible: false,
            },
            absoluteForm: {
                ...absoluteForm,
                visible: false,
            },
            absolutePresets: [
                {
                    ...year2019,
                    visible: false,
                },
            ],
            relativeForm: {
                ...relativeForm,
                availableGranularities: [],
            },
            relativePresets: [
                {
                    ...lastMonth,
                    visible: false,
                },
            ],
            selectedOption: allTime.localIdentifier,
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("NoVisibleOptions");
    });

    it("should not validate config with non-unique localIdentifiers", async () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotValidateConfigWithNonUniqueLocalIdentifiers"),
            allTime: {
                ...allTime,
                localIdentifier: "FOO",
            },
            absoluteForm: {
                ...absoluteForm,
                localIdentifier: "FOO",
            },
            selectedOption: "FOO",
        };

        const actual = await suppressConsole(
            () => validateDateFilterConfig(projectConfig),
            "warn",
            (message: string) =>
                message === "There were duplicate localIdentifiers in the date filter config: FOO",
        );
        expect(actual).toEqual("ConflictingIdentifiers");
    });

    it("should validate config with visible selected option", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldValidateConfigWithVisibleSelectedOption"),
            allTime,
            absoluteForm,
            selectedOption: allTime.localIdentifier,
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("Valid");
    });

    it("should not validate config with selected option not visible", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotValidateConfigWithSelectedOptionNotVisible"),
            allTime: {
                ...allTime,
                visible: false,
            },
            absoluteForm,
            selectedOption: allTime.localIdentifier,
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("SelectedOptionInvalid");
    });

    it("should not validate config with non-existing selected option", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotValidateConfigWithNonExistingSelectedOption"),
            allTime: {
                ...allTime,
                visible: false,
            },
            absoluteForm,
            selectedOption: "INVALID",
        };

        const actual = validateDateFilterConfig(projectConfig);
        expect(actual).toEqual("SelectedOptionInvalid");
    });
});
