// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { recordedBackend } from "../index";

describe("recordedBackend", () => {
    describe("organization", () => {
        describe("securitySettings", () => {
            const ORGANIZATION_ID = "myOrganizationId";
            const TESTED_URL = "https://gooddata.com";

            describe("isUrlValid", () => {
                it("should return true when custom url validator is not configured", async () => {
                    const isUrlValid = await recordedBackend(ReferenceRecordings.Recordings)
                        .organization(ORGANIZATION_ID)
                        .securitySettings()
                        .isUrlValid(TESTED_URL, "UI_EVENT");

                    expect(isUrlValid).toBe(true);
                });

                it.each([[true], [false]])(
                    "should return %s when custom url validator is configured to return it",
                    async (validatorReturnValue) => {
                        const isUrlValid = await recordedBackend(ReferenceRecordings.Recordings, {
                            securitySettingsUrlValidator: () => validatorReturnValue,
                        })
                            .organization(ORGANIZATION_ID)
                            .securitySettings()
                            .isUrlValid(TESTED_URL, "UI_EVENT");

                        expect(isUrlValid).toBe(validatorReturnValue);
                    },
                );
            });
        });
    });
});
