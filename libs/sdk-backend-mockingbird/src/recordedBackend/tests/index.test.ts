// (C) 2021-2024 GoodData Corporation
import { describe, expect, it } from "vitest";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

import { recordedBackend } from "../index.js";

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

            describe("scope", () => {
                it("should build expected value when securitySettingsOrganizationScope is not configured", () => {
                    const { scope } = recordedBackend(ReferenceRecordings.Recordings)
                        .organization(ORGANIZATION_ID)
                        .securitySettings();

                    expect(scope).toBe("/gdc/domains/myOrganizationId");
                });

                it("should build expected value when securitySettingsOrganizationScope is configured", () => {
                    const { scope } = recordedBackend(ReferenceRecordings.Recordings, {
                        securitySettingsOrganizationScope: (organizationId) => `#${organizationId}#`,
                    })
                        .organization(ORGANIZATION_ID)
                        .securitySettings();

                    expect(scope).toBe("#myOrganizationId#");
                });
            });
        });

        describe("notificationChannels", () => {
            const ORGANIZATION_ID = "myOrganizationId";

            it("empty list of webhooks", async () => {
                const data = await recordedBackend(ReferenceRecordings.Recordings)
                    .organization(ORGANIZATION_ID)
                    .notificationChannels()
                    .getWebhooks();

                expect(data).toEqual([]);
            });

            it("create webhook", async () => {
                const data = await recordedBackend(ReferenceRecordings.Recordings)
                    .organization(ORGANIZATION_ID)
                    .notificationChannels()
                    .createWebhook({
                        type: "webhook",
                        destination: {
                            name: "name",
                            endpoint: "endpoint",
                            token: "token",
                        },
                        triggers: [
                            {
                                type: "SCHEDULE",
                                allowOn: ["dashboard", "visualization"],
                            },
                            {
                                type: "ALERT",
                            },
                        ],
                    });

                expect(data).toEqual({
                    id: "dummyWebhook",
                    type: "webhook",
                    destination: {
                        endpoint: "endpoint",
                        name: "name",
                        token: "token",
                    },
                    triggers: [
                        {
                            allowOn: ["dashboard", "visualization"],
                            type: "SCHEDULE",
                        },
                        {
                            type: "ALERT",
                        },
                    ],
                });
            });

            it("update webhook", async () => {
                const data = await recordedBackend(ReferenceRecordings.Recordings)
                    .organization(ORGANIZATION_ID)
                    .notificationChannels()
                    .updateWebhook({
                        id: "webhook-id",
                        type: "webhook",
                        destination: {
                            name: "name",
                            endpoint: "endpoint",
                            token: "token",
                        },
                        triggers: [
                            {
                                type: "SCHEDULE",
                                allowOn: ["dashboard", "visualization"],
                            },
                            {
                                type: "ALERT",
                            },
                        ],
                    });

                expect(data).toEqual({
                    id: "webhook-id",
                    type: "webhook",
                    destination: {
                        endpoint: "endpoint",
                        name: "name",
                        token: "token",
                    },
                    triggers: [
                        {
                            allowOn: ["dashboard", "visualization"],
                            type: "SCHEDULE",
                        },
                        {
                            type: "ALERT",
                        },
                    ],
                });
            });

            it("delete webhook", async () => {
                const data = await recordedBackend(ReferenceRecordings.Recordings)
                    .organization(ORGANIZATION_ID)
                    .notificationChannels()
                    .deleteWebhook("webhook-id");

                expect(data).toBeUndefined();
            });
        });
    });

    describe("workspace", () => {
        const WORKSPACE_ID = "workspaceId";

        describe("descriptor", () => {
            it("should return default empty workspace descriptor", async () => {
                const descriptor = await recordedBackend(ReferenceRecordings.Recordings)
                    .workspace(WORKSPACE_ID)
                    .getDescriptor();

                expect(descriptor).toEqual({
                    id: WORKSPACE_ID,
                    title: "",
                    description: "",
                    isDemo: false,
                } as IWorkspaceDescriptor);
            });

            it("should return from partial filled workspace descriptor", async () => {
                const config = {
                    workspaceDescriptor: {
                        title: "Title",
                    },
                };
                const descriptor = await recordedBackend(ReferenceRecordings.Recordings, config)
                    .workspace(WORKSPACE_ID)
                    .getDescriptor();

                expect(descriptor).toEqual({
                    id: WORKSPACE_ID,
                    isDemo: false,
                    description: "",
                    ...config.workspaceDescriptor,
                } as IWorkspaceDescriptor);
            });

            it("should return from filled workspace descriptor", async () => {
                const config = {
                    workspaceDescriptor: {
                        title: "Title",
                        description: "Description",
                        isDemo: true,
                    },
                };
                const descriptor = await recordedBackend(ReferenceRecordings.Recordings, config)
                    .workspace(WORKSPACE_ID)
                    .getDescriptor();

                expect(descriptor).toEqual({
                    id: WORKSPACE_ID,
                    ...config.workspaceDescriptor,
                } as IWorkspaceDescriptor);
            });
        });
    });
});
