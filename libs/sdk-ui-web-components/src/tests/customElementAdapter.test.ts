// (C) 2022-2026 GoodData Corporation

// @vitest-environment happy-dom

import { createElement } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

const flushMicrotasks = async (count = 4) => {
    for (let i = 0; i < count; i += 1) {
        await Promise.resolve();
    }
};

describe("CustomElementAdapter", () => {
    beforeEach(() => {
        vi.resetModules();
        document.body.innerHTML = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should prefer live property values over bootstrap attributes", async () => {
        const { setContext } = await import("../context.js");
        const { CustomElementAdapter, GET_COMPONENT, LOAD_COMPONENT } =
            await import("../common/CustomElementAdapter.js");

        const renders: Array<{ bootstrap: unknown }> = [];

        class TestElement extends CustomElementAdapter<() => ReturnType<typeof createElement>> {
            static get observedAttributes() {
                return ["bootstrap"];
            }

            protected override getLiveProperties(): string[] {
                return ["bootstrap"];
            }

            async [LOAD_COMPONENT](): Promise<() => ReturnType<typeof createElement>> {
                return () => createElement("div");
            }

            [GET_COMPONENT](Component: () => ReturnType<typeof createElement>) {
                renders.push({
                    bootstrap: this.getResolvedInputValue("bootstrap"),
                });

                return createElement(Component);
            }
        }

        const tagName = "test-adapter-precedence";
        customElements.define(tagName, TestElement);

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const element = document.createElement(tagName) as HTMLElement & { bootstrap?: string };
        element.setAttribute("bootstrap", "from-attribute");

        document.body.append(element);
        await flushMicrotasks();

        element.bootstrap = "from-property";
        await flushMicrotasks();

        expect(renders.at(-1)).toEqual({ bootstrap: "from-property" });
    });

    it("should batch multiple property assignments into one rerender", async () => {
        const { setContext } = await import("../context.js");
        const { CustomElementAdapter, GET_COMPONENT, LOAD_COMPONENT } =
            await import("../common/CustomElementAdapter.js");

        const renders: Array<{ first: unknown; second: unknown }> = [];

        class TestElement extends CustomElementAdapter<() => ReturnType<typeof createElement>> {
            protected override getLiveProperties(): string[] {
                return ["first", "second"];
            }

            async [LOAD_COMPONENT](): Promise<() => ReturnType<typeof createElement>> {
                return () => createElement("div");
            }

            [GET_COMPONENT](Component: () => ReturnType<typeof createElement>) {
                renders.push({
                    first: this.getLivePropertyValue("first"),
                    second: this.getLivePropertyValue("second"),
                });

                return createElement(Component);
            }
        }

        const tagName = "test-adapter-batching";
        customElements.define(tagName, TestElement);

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const element = document.createElement(tagName) as HTMLElement & {
            first?: string;
            second?: string;
        };

        document.body.append(element);
        await flushMicrotasks();

        const initialRenderCount = renders.length;

        element.first = "alpha";
        element.second = "beta";

        await flushMicrotasks();

        expect(renders).toHaveLength(initialRenderCount + 1);
        expect(renders.at(-1)).toEqual({ first: "alpha", second: "beta" });
    });

    it("should dispatch gd-ready once and reject identity changes after first successful render", async () => {
        const { setContext } = await import("../context.js");
        const { CustomElementAdapter, GET_COMPONENT, LOAD_COMPONENT } =
            await import("../common/CustomElementAdapter.js");

        const renders: Array<{ identity: unknown }> = [];
        const readyEvents: Event[] = [];
        const errorEvents: Array<{ phase: string; message: string }> = [];

        class TestElement extends CustomElementAdapter<() => ReturnType<typeof createElement>> {
            protected override getLiveProperties(): string[] {
                return ["identity", "other"];
            }

            protected override getIdentityProperties(): string[] {
                return ["identity"];
            }

            async [LOAD_COMPONENT](): Promise<() => ReturnType<typeof createElement>> {
                return () => createElement("div");
            }

            [GET_COMPONENT](Component: () => ReturnType<typeof createElement>) {
                renders.push({
                    identity: this.getResolvedInputValue("identity"),
                });

                return createElement(Component);
            }
        }

        const tagName = "test-adapter-identity";
        customElements.define(tagName, TestElement);

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const element = document.createElement(tagName) as HTMLElement & {
            identity?: string;
            other?: string;
        };

        element.addEventListener("gd-ready", (event) => {
            readyEvents.push(event);
        });
        element.addEventListener("gd-error", (event) => {
            errorEvents.push((event as CustomEvent<{ phase: string; message: string }>).detail);
        });

        document.body.append(element);
        element.identity = "first";
        await flushMicrotasks();

        const renderCountAfterReady = renders.length;

        element.other = "rerender";
        await flushMicrotasks();

        expect(readyEvents).toHaveLength(1);
        expect(renders).toHaveLength(renderCountAfterReady + 1);

        const renderCountBeforeIdentityChange = renders.length;

        element.identity = "second";
        await flushMicrotasks();

        expect(renders).toHaveLength(renderCountBeforeIdentityChange);
        expect(renders.at(-1)).toEqual({ identity: "first" });
        expect(errorEvents.at(-1)).toMatchObject({
            phase: "invalidUsage",
            message: '"identity" cannot change after first render.',
        });
    });
});
