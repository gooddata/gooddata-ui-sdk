// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type MouseEvent } from "react";

import { describe, expect, it } from "vitest";

import {
    type ILocalPluggableApplicationRegistryItemV1,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type EmbeddingMode, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { getWorkspaceSwitchPath, isPlainLeftClick } from "./chromeHelpers.js";

function clickEvent(overrides: Partial<MouseEvent<Element>> = {}): MouseEvent<Element> {
    return {
        defaultPrevented: false,
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...overrides,
    } as MouseEvent<Element>;
}

describe("isPlainLeftClick", () => {
    it("accepts a left click with no modifier held", () => {
        expect(isPlainLeftClick(clickEvent())).toBe(true);
    });

    it.each([
        ["another handler already took the click", { defaultPrevented: true }],
        ["the middle button was used", { button: 1 }],
        ["the right button was used", { button: 2 }],
        ["Cmd was held", { metaKey: true }],
        ["Ctrl was held", { ctrlKey: true }],
        ["Shift was held", { shiftKey: true }],
        ["Alt was held", { altKey: true }],
    ])("returns false when %s", (_case, overrides) => {
        expect(isPlainLeftClick(clickEvent(overrides))).toBe(false);
    });
});

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
        currentWorkspaceId: "old-workspace",
        ...overrides,
    };
}

function localApp(
    overrides: Partial<ILocalPluggableApplicationRegistryItemV1> = {},
): ILocalPluggableApplicationRegistryItemV1 {
    return {
        apiVersion: "1.0",
        id: "gdc-reports",
        title: "Reports",
        applicationScope: "workspace",
        menuOrder: 20,
        local: { routeBase: "/reports" },
        ...overrides,
    };
}

describe("getWorkspaceSwitchPath", () => {
    const reports = localApp();
    const aiHub = localApp({
        id: "gdc-ai-hub",
        title: "AI Hub",
        applicationScope: "organization",
        local: { routeBase: "/ai-hub" },
    });
    const apps: PluggableApplicationRegistryItem[] = [reports, aiHub];

    it("drops the object id of the workspace the object belongs to", () => {
        const path = getWorkspaceSwitchPath(
            "/workspace/old-workspace/reports/report/report-id",
            "new-workspace",
            apps,
            context(),
        );

        expect(path).toBe("/workspace/new-workspace/reports");
    });

    it("drops an application screen the host cannot tell from an object id", () => {
        const path = getWorkspaceSwitchPath(
            "/workspace/old-workspace/reports/templates",
            "new-workspace",
            apps,
            context(),
        );

        expect(path).toBe("/workspace/new-workspace/reports");
    });

    it("lands on the application the user is in", () => {
        const path = getWorkspaceSwitchPath(
            "/workspace/old-workspace/reports",
            "new-workspace",
            apps,
            context(),
        );

        expect(path).toBe("/workspace/new-workspace/reports");
    });

    it("swaps the workspace when no workspace application claims the path", () => {
        const path = getWorkspaceSwitchPath("/workspace/old-workspace", "new-workspace", apps, context());

        expect(path).toBe("/workspace/new-workspace");
    });

    it("swaps the workspace when the active application is organization scoped", () => {
        const path = getWorkspaceSwitchPath(
            "/organization/ai-hub/chat",
            "new-workspace",
            apps,
            context({ currentWorkspaceId: undefined }),
        );

        expect(path).toBe("/workspace/new-workspace");
    });
});
