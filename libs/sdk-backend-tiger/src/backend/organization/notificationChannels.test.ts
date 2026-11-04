// (C) 2026 GoodData Corporation

import axios from "axios";
import { describe, expect, it } from "vitest";

import {
    type IWebhookDestinationConfiguration,
    type IWebhookNotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

import { OrganizationNotificationChannelService } from "./notificationChannels.js";

const webhook: IWebhookNotificationChannelMetadataObject = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "webhook-id",
    title: "Webhook",
    sendInPlatformNotifications: false,
    destinationConfig: { endpoint: "https://receiver.example" },
};

function createService(responseData: unknown) {
    const requests: { method: string | undefined; url: string | undefined; body: unknown }[] = [];
    const client = {
        basePath: "https://backend.example",
        setApiToken: () => undefined,
        axios: axios.create({
            adapter: async (config) => {
                requests.push({ method: config.method, url: config.url, body: JSON.parse(config.data) });
                return { data: responseData, status: 200, statusText: "OK", headers: {}, config };
            },
        }),
    };
    return {
        service: new OrganizationNotificationChannelService((call) =>
            call(client, { getPrincipal: async () => ({ userId: "user" }) }),
        ),
        requests,
    };
}

const response = {
    data: {
        id: webhook.id,
        type: "notificationChannel",
        attributes: {
            name: webhook.title,
            destinationType: "WEBHOOK",
            destination: { type: "WEBHOOK", url: "https://receiver.example", hasSecretKey: true },
        },
    },
};

const updateCases: {
    name: string;
    config: IWebhookDestinationConfiguration;
    expectedConfig?: IWebhookDestinationConfiguration;
    method: string;
}[] = [
    { name: "preserves a signing-only secret", config: { hasSecretKey: true }, method: "patch" },
    { name: "preserves a bearer token", config: { hasToken: true }, method: "patch" },
    { name: "preserves both credentials", config: { hasToken: true, hasSecretKey: true }, method: "patch" },
    {
        name: "replaces token while preserving secret",
        config: { token: "new-token", hasSecretKey: true },
        method: "patch",
    },
    {
        name: "replaces secret while preserving token",
        config: { hasToken: true, secretKey: "new-secret" },
        method: "patch",
    },
    {
        name: "disables token while preserving secret",
        config: { token: "", hasToken: false, hasSecretKey: true },
        method: "patch",
    },
    {
        name: "disables secret while preserving token",
        config: { secretKey: "", hasSecretKey: false, hasToken: true },
        method: "patch",
    },
    {
        name: "replaces both explicit values despite presence flags",
        config: { token: "new-token", secretKey: "new-secret", hasToken: true, hasSecretKey: true },
        method: "put",
    },
    {
        name: "preserves whitespace in explicit credentials",
        config: { token: " bearer-token ", secretKey: " signing-secret " },
        method: "put",
    },
    {
        name: "disables both explicit values despite presence flags",
        config: { token: "", secretKey: "", hasToken: true, hasSecretKey: true },
        expectedConfig: { hasToken: true, hasSecretKey: true },
        method: "put",
    },
    {
        name: "omits unconfigured credentials",
        config: { hasToken: false, hasSecretKey: false },
        method: "put",
    },
];

describe("OrganizationNotificationChannelService webhook credentials", () => {
    it.each(updateCases)("$name", async ({ config, expectedConfig = config, method }) => {
        const { service, requests } = createService(response);
        const updated = await service.updateNotificationChannel({
            ...webhook,
            destinationConfig: { ...webhook.destinationConfig, ...config },
        });

        expect(updated.destinationConfig).toEqual(expect.objectContaining({ hasSecretKey: true }));
        expect(requests).toHaveLength(1);
        expect(requests[0]?.method).toBe(method);
        expect(requests[0]?.body).toEqual({
            data: expect.objectContaining({
                attributes: expect.objectContaining({
                    destination: { type: "WEBHOOK", url: "https://receiver.example", ...expectedConfig },
                }),
            }),
        });
    });

    it.each(updateCases)("tests the effective credential configuration when it $name", async ({ config }) => {
        const { service, requests } = createService({ successful: true });
        await expect(
            service.testNotificationChannel({
                ...webhook,
                destinationConfig: { ...webhook.destinationConfig, ...config },
            }),
        ).resolves.toEqual({ successful: true });
        expect(requests).toHaveLength(1);
        expect(requests[0]?.method).toBe("post");
        expect(requests[0]?.body).toEqual({
            destination: { type: "WEBHOOK", url: "https://receiver.example", ...config },
        });
        expect(requests[0]?.url).toContain(webhook.id);
    });

    it("passes the signing secret to a new-channel test", async () => {
        const { service, requests } = createService({ successful: true });
        await service.testNotificationChannel({
            type: "notificationChannel",
            destinationType: "webhook",
            title: "New webhook",
            sendInPlatformNotifications: false,
            destinationConfig: { endpoint: "https://receiver.example", secretKey: "shared-secret" },
        });
        expect(requests[0]?.body).toEqual({
            destination: { type: "WEBHOOK", url: "https://receiver.example", secretKey: "shared-secret" },
        });
    });

    it.each(["token", "secretKey"] as const)("omits an empty %s when creating a webhook", async (field) => {
        const { service, requests } = createService({
            data: {
                ...response.data,
                attributes: {
                    ...response.data.attributes,
                    destination: {
                        type: "WEBHOOK",
                        url: "https://receiver.example",
                        hasToken: false,
                        hasSecretKey: false,
                    },
                },
            },
        });
        const created = await service.createNotificationChannel({
            type: "notificationChannel",
            destinationType: "webhook",
            title: "New webhook",
            sendInPlatformNotifications: false,
            destinationConfig: { endpoint: "https://receiver.example", [field]: "" },
        });

        expect(created.destinationConfig).toEqual(
            expect.objectContaining({ hasToken: false, hasSecretKey: false }),
        );
        expect(requests[0]?.method).toBe("post");
        expect(requests[0]?.body).toEqual({
            data: expect.objectContaining({
                attributes: expect.objectContaining({
                    destination: { type: "WEBHOOK", url: "https://receiver.example" },
                }),
            }),
        });
    });

    it.each([
        {
            field: "token",
            config: { token: "", secretKey: "signing-secret" },
            expectedConfig: { secretKey: "signing-secret" },
        },
        {
            field: "secretKey",
            config: { token: "bearer-token", secretKey: "" },
            expectedConfig: { token: "bearer-token" },
        },
    ])(
        "omits an empty $field on PUT while keeping the other credential",
        async ({ config, expectedConfig }) => {
            const { service, requests } = createService(response);
            await service.updateNotificationChannel({
                ...webhook,
                destinationConfig: { ...webhook.destinationConfig, ...config },
            });

            expect(requests[0]?.method).toBe("put");
            expect(requests[0]?.body).toEqual({
                data: expect.objectContaining({
                    attributes: expect.objectContaining({
                        destination: { type: "WEBHOOK", url: "https://receiver.example", ...expectedConfig },
                    }),
                }),
            });
        },
    );

    it("omits empty credentials when testing a new webhook", async () => {
        const { service, requests } = createService({ successful: true });
        await service.testNotificationChannel({
            type: "notificationChannel",
            destinationType: "webhook",
            title: "New webhook",
            sendInPlatformNotifications: false,
            destinationConfig: { endpoint: "https://receiver.example", token: "", secretKey: "" },
        });

        expect(requests[0]?.body).toEqual({
            destination: { type: "WEBHOOK", url: "https://receiver.example" },
        });
    });
});
