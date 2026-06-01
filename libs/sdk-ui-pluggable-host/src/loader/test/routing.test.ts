// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IExternalPluggableApplicationRegistryItemV1,
    type ILocalPluggableApplicationRegistryItemV1,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type EmbeddingMode, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { getActiveInternalApplication, getApplicationHref } from "../routing.js";

function context(overrides: Partial<IPlatformContext> = {}): IPlatformContext {
    const userSettings = {
        userId: "test-user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
    };
    return {
        version: "1.0",
        auth: { type: "contextDeferred" as const },
        user: {
            login: "test@example.com",
            ref: { identifier: "test-user", type: "user" },
        },
        userSettings,
        settings: userSettings,
        whiteLabeling: undefined,
        embeddingMode: "none" as EmbeddingMode,
        ...overrides,
    };
}

function localApp(
    overrides: Partial<ILocalPluggableApplicationRegistryItemV1>,
): ILocalPluggableApplicationRegistryItemV1 {
    return {
        apiVersion: "1.0",
        id: "gdc-ai-hub",
        title: "AI Hub",
        applicationScope: "organization",
        menuOrder: 60,
        local: {
            routeBase: "/ai-hub",
        },
        ...overrides,
    };
}

function externalApp(
    url: string,
    overrides: Partial<IExternalPluggableApplicationRegistryItemV1> = {},
): IExternalPluggableApplicationRegistryItemV1 {
    return {
        apiVersion: "1.0",
        id: "gdc-dashboards",
        title: "Dashboards",
        applicationScope: "workspace",
        menuOrder: 10,
        external: { url },
        ...overrides,
    };
}

describe("routing", () => {
    it("builds organization local application href", () => {
        const href = getApplicationHref(localApp({}), context(), "/organization");
        expect(href).toBe("/organization/ai-hub");
    });

    it("finds active internal application by route prefix", () => {
        const app = localApp({});
        const apps: PluggableApplicationRegistryItem[] = [app];

        const active = getActiveInternalApplication(apps, context(), "/organization/ai-hub/chat");

        expect(active?.id).toBe("gdc-ai-hub");
    });

    it("throws for unsupported application scope", () => {
        const app = {
            ...localApp({}),
            // Testing runtime guard for unexpected future/invalid values.
            applicationScope: "unknown-scope",
        } as unknown as ILocalPluggableApplicationRegistryItemV1;

        expect(() => getApplicationHref(app, context(), "/organization")).toThrow(
            '[host-runtime/routing] Unsupported application scope "unknown-scope" for app "gdc-ai-hub".',
        );
    });

    describe("external app URL", () => {
        it("substitutes {workspaceId} placeholder from ctx.currentWorkspaceId", () => {
            const app = externalApp("/dashboards/#/project/{workspaceId}");
            const href = getApplicationHref(app, context({ currentWorkspaceId: "ws-1" }), "/workspace/ws-1");
            expect(href).toBe("/dashboards/#/project/ws-1");
        });

        it("falls back to the workspace id from pathname when ctx.currentWorkspaceId is unset", () => {
            const app = externalApp("/analyze/#/{workspaceId}");
            const href = getApplicationHref(app, context(), "/workspace/ws-2/catalog/objects");
            expect(href).toBe("/analyze/#/ws-2");
        });

        it("substitutes empty string when no workspace is resolvable", () => {
            const app = externalApp("/modeler/#/{workspaceId}");
            const href = getApplicationHref(app, context(), "/organization/settings");
            expect(href).toBe("/modeler/#/");
        });

        it("passes URLs without a placeholder through unchanged", () => {
            const app = externalApp("https://docs.example.com");
            const href = getApplicationHref(app, context({ currentWorkspaceId: "ws-1" }), "/workspace/ws-1");
            expect(href).toBe("https://docs.example.com");
        });

        it("substitutes every occurrence when the placeholder appears more than once", () => {
            const app = externalApp("/x/{workspaceId}/y/{workspaceId}");
            const href = getApplicationHref(app, context({ currentWorkspaceId: "ws-1" }), "/workspace/ws-1");
            expect(href).toBe("/x/ws-1/y/ws-1");
        });
    });
});
