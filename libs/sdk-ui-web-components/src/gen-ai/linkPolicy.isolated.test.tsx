// (C) 2026 GoodData Corporation

// @vitest-environment happy-dom

import { act } from "react";

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import type { GenAIAssistantProps, GenAiStoreProps } from "@gooddata/sdk-ui-gen-ai";

import { getStore, setContext } from "../context.js";

import { GenAIAssistant } from "./GenAiAssistant.js";
import { GenAIConversations } from "./GenAiConversations.js";
import { GenAiProvider } from "./GenAiProvider.js";

const { assistantRender, conversationsRender, storeRender } = vi.hoisted(() => ({
    assistantRender: vi.fn<(props: GenAIAssistantProps) => void>(),
    conversationsRender: vi.fn<(props: GenAIAssistantProps) => void>(),
    storeRender: vi.fn<(props: GenAiStoreProps) => void>(),
}));

vi.mock("@gooddata/sdk-ui-gen-ai", () => ({
    GenAIAssistant: (props: GenAIAssistantProps) => {
        assistantRender(props);
        return null;
    },
    GenAIConversations: (props: GenAIAssistantProps) => {
        conversationsRender(props);
        return null;
    },
    GenAiStore: (props: GenAiStoreProps) => {
        storeRender(props);
        return null;
    },
}));

type AiElement = HTMLElement & Pick<GenAiStoreProps, "isLinkEnabled">;
type ActEnvironmentHost = typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

const dashboardsOnly: NonNullable<GenAiStoreProps["isLinkEnabled"]> = (type) => type === "dashboard";
const disableLinks = () => false;

async function actAndFlush(callback: () => void) {
    await act(async () => {
        callback();
        for (let i = 0; i < 10; i += 1) {
            await Promise.resolve();
        }
        await vi.dynamicImportSettled();
    });
}

function createAiElement(tag: string) {
    return document.createElement(tag) as AiElement;
}

describe("AI web component object-link policy", () => {
    let previousActEnvironment: boolean | undefined;

    beforeAll(() => {
        class GenAIChat extends GenAIAssistant {}

        customElements.define("gd-ai-assistant", GenAIAssistant);
        customElements.define("gd-ai-chat", GenAIChat);
        customElements.define("gd-ai-conversations", GenAIConversations);
        customElements.define("gd-ai-provider", GenAiProvider);
    });

    beforeEach(() => {
        previousActEnvironment = (globalThis as ActEnvironmentHost).IS_REACT_ACT_ENVIRONMENT;
        (globalThis as ActEnvironmentHost).IS_REACT_ACT_ENVIRONMENT = true;
        vi.clearAllMocks();
        setContext({ backend: dummyBackend(), workspaceId: "workspace" });
    });

    afterEach(async () => {
        await actAndFlush(() => document.body.replaceChildren());
        (globalThis as ActEnvironmentHost).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    });

    describe.each([
        ["gd-ai-assistant", assistantRender],
        ["gd-ai-chat", assistantRender],
        ["gd-ai-conversations", conversationsRender],
    ] as const)("%s", (tag, render) => {
        it("leaves the policy unset by default", async () => {
            await actAndFlush(() => document.body.append(createAiElement(tag)));

            expect(render).toHaveBeenCalled();
            expect(render.mock.lastCall?.[0].isLinkEnabled).toBeUndefined();
        });

        it("forwards the initial policy", async () => {
            const element = createAiElement(tag);
            element.isLinkEnabled = dashboardsOnly;
            await actAndFlush(() => document.body.append(element));

            expect(render.mock.lastCall?.[0].isLinkEnabled).toBe(dashboardsOnly);
        });
    });

    it("leaves the provider policy unset by default", async () => {
        const provider = createAiElement("gd-ai-provider");
        provider.append(createAiElement("gd-ai-assistant"));
        await actAndFlush(() => document.body.append(provider));

        expect(storeRender).toHaveBeenCalled();
        expect(storeRender.mock.lastCall?.[0].isLinkEnabled).toBeUndefined();
        expect(assistantRender).toHaveBeenCalled();
        expect(assistantRender.mock.lastCall?.[0].isLinkEnabled).toBeUndefined();
    });

    it("applies the provider policy to the shared store and children across React roots", async () => {
        const provider = createAiElement("gd-ai-provider");
        const assistant = createAiElement("gd-ai-assistant");
        const chat = createAiElement("gd-ai-chat");
        const conversations = createAiElement("gd-ai-conversations");
        provider.isLinkEnabled = dashboardsOnly;
        const container = document.createElement("main");
        container.append(assistant, chat, conversations);
        provider.append(container);
        await actAndFlush(() => document.body.append(provider));

        expect(storeRender.mock.lastCall?.[0].isLinkEnabled).toBe(dashboardsOnly);
        expect(assistantRender.mock.calls.every(([props]) => props.isLinkEnabled === dashboardsOnly)).toBe(
            true,
        );
        expect(conversationsRender.mock.lastCall?.[0].isLinkEnabled).toBe(dashboardsOnly);
        const providedStore = getStore(provider.getAttribute("store")!);
        expect(providedStore).toBeDefined();
        expect(assistantRender.mock.lastCall?.[0].providedStore).toBe(providedStore);
        expect(conversationsRender.mock.lastCall?.[0].providedStore).toBe(providedStore);
    });

    it("lets a child's initial policy override the provider", async () => {
        const provider = createAiElement("gd-ai-provider");
        const assistant = createAiElement("gd-ai-assistant");
        provider.isLinkEnabled = disableLinks;
        assistant.isLinkEnabled = dashboardsOnly;
        provider.append(assistant);
        await actAndFlush(() => document.body.append(provider));

        expect(assistantRender.mock.lastCall?.[0].isLinkEnabled).toBe(dashboardsOnly);
        expect(storeRender.mock.lastCall?.[0].isLinkEnabled).toBe(disableLinks);
    });

    it("uses the nearest store's policy for nested providers and newly added children", async () => {
        const outer = createAiElement("gd-ai-provider");
        const inner = createAiElement("gd-ai-provider");
        outer.isLinkEnabled = disableLinks;
        inner.isLinkEnabled = dashboardsOnly;
        await actAndFlush(() => document.body.append(outer));
        await actAndFlush(() => outer.append(inner));

        await actAndFlush(() => inner.append(createAiElement("gd-ai-assistant")));
        expect(assistantRender.mock.lastCall?.[0].isLinkEnabled).toBe(dashboardsOnly);
    });
});
