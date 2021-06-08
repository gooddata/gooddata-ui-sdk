// (C) 2019-2020 GoodData Corporation
import { DefaultLocale } from "@gooddata/sdk-ui";
import { createInternalIntl } from "../../internalIntlProvider";
import { getHeadlineUiConfig } from "../headlineUiConfigHelper";
import * as referencePointMocks from "../../../tests/mocks/referencePointMocks";

describe("headlineUiConfigHelper", () => {
    describe("getHeadlineUiConfig", () => {
        const intl = createInternalIntl(DefaultLocale);

        describe("'canAddItems' property", () => {
            const uiConfig = getHeadlineUiConfig(
                referencePointMocks.headlineWithMeasureInPrimaryBucket,
                intl,
            );

            it("should set 'canAddItems' bucket property falsy if it already contains a measure", () => {
                expect(uiConfig.buckets.secondary_measures.canAddItems).toBeTruthy();
            });

            it("should set 'canAddItems' bucket property truthy if it has no measures", () => {
                expect(uiConfig.buckets.measures.canAddItems).toBeFalsy();
            });
        });

        describe("'icon' property", () => {
            it("should set 'icon' property in both 'measures' and 'secondary_measures' buckets", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.buckets.measures.icon).toBeDefined();
                expect(uiConfig.buckets.secondary_measures.icon).toBeDefined();
            });
        });

        describe("'customError' property", () => {
            it("should set 'customError' property if there is a measure in 'secondary_measures' bucket, but 'measures' bucket is empty", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInSecondaryBucket,
                    intl,
                );
                expect(uiConfig.customError).toHaveProperty("heading");
                expect(uiConfig.customError).toHaveProperty("text");
            });

            it("should keep 'customError' property empty if one of buckets contains a measure", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.customError).toBeUndefined();
            });
        });

        describe("measures bucket titles", () => {
            it("should set bucket titles", () => {
                const uiConfig = getHeadlineUiConfig(
                    referencePointMocks.headlineWithMeasureInPrimaryBucket,
                    intl,
                );
                expect(uiConfig.buckets.measures.title).toEqual("Measure");
                expect(uiConfig.buckets.secondary_measures.title).toEqual("Measure");
            });
        });
    });
});
