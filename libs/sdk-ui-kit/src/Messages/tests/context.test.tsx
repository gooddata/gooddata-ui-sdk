// (C) 2025 GoodData Corporation

import { type ReactNode, useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { ToastsCenterContext, useToastsCenterValue } from "../toasts/context.js";
import { ToastsCenter } from "../toasts/ToastsCenter.js";
import { type IMessage, type IMessageDefinition } from "../typings.js";

const intlMessages = {
    "messages.accessibility.noMessages": "No messages",
    "messages.accessibility.partial.error": "{count} errors",
    "messages.accessibility.partial.warning": "{count} warnings",
    "messages.accessibility.partial.success": "{count} success",
    "messages.accessibility.partial.progress": "{count} in progress",
    "messages.accessibility.label": "There are {count} messages: {partial}",
    "message.accessibility.dismiss.notification": "Dismiss notification",
};

function PlainToastsProvider(props: { onDismiss?: (id: IMessage["id"]) => void; children?: ReactNode }) {
    const value = useToastsCenterValue(props.onDismiss);
    return <ToastsCenterContext value={value}>{props.children}</ToastsCenterContext>;
}

function Inspector(props: { testId: string }) {
    const { messages, latestMessage, hasParentContext } = ToastsCenterContext.useContextStoreValues([
        "messages",
        "latestMessage",
        "hasParentContext",
    ]);

    return (
        <div>
            <div data-testid={`${props.testId}-count`}>{messages.length}</div>
            <div data-testid={`${props.testId}-latest`}>{latestMessage?.id || ""}</div>
            <div data-testid={`${props.testId}-has-parent`}>{hasParentContext ? "yes" : "no"}</div>
        </div>
    );
}

function getInspectorValues(testId: string) {
    const count = Number(screen.getByTestId(`${testId}-count`).textContent);
    const latest = screen.getByTestId(`${testId}-latest`).textContent;
    const hasParent = screen.getByTestId(`${testId}-has-parent`).textContent === "yes";
    return { count, latest, hasParent };
}

const successMsg = (overrides: Partial<IMessageDefinition> = {}): IMessageDefinition => ({
    type: "success",
    text: "ok",
    duration: 0,
    ...overrides,
});

describe("ToastsCenter context", () => {
    it("adds, updates latest, removes and removeAll works", async () => {
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <PlainToastsProvider>
                    <Inspector testId="outer" />
                    <Capture />
                </PlainToastsProvider>
            </IntlProvider>,
        );

        expect(getInspectorValues("outer").count).toBe(0);

        const m1 = api.addMessage(successMsg());
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));
        expect(getInspectorValues("outer").latest).toBe(m1.id);

        const m2 = api.addMessage(successMsg());
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(2));
        // latest should switch to m2
        expect(getInspectorValues("outer").latest).toBe(m2.id);

        api.removeMessage(m1.id);
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));

        api.removeAllMessages();
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(0));
    });

    it("auto-dismiss removes message after duration and calls onDismissMessage", async () => {
        const onDismiss = vi.fn();
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <PlainToastsProvider onDismiss={onDismiss}>
                    <Inspector testId="outer" />
                    <Capture />
                </PlainToastsProvider>
            </IntlProvider>,
        );

        // Use a short real duration for testing
        const m = api.addMessage(successMsg({ duration: 50 }));
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));

        // Wait for the auto-dismiss to happen
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(0), { timeout: 200 });
        expect(onDismiss).toHaveBeenCalledWith(m.id);
    });

    it("addExistingMessage replaces by id and updates latest", async () => {
        let api!: ReturnType<typeof useToastsCenterValue>;
        function Capture() {
            api = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }
        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <PlainToastsProvider>
                    <Inspector testId="outer" />
                    <Capture />
                </PlainToastsProvider>
            </IntlProvider>,
        );

        const base: IMessage = { id: "id-1", type: "success", text: "a", createdAt: 1, duration: 0 };
        api.addExistingMessage(base);
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));

        // Replace same id with newer createdAt
        const replacement: IMessage = { ...base, text: "b", createdAt: 2 };
        api.addExistingMessage(replacement);
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));
        expect(getInspectorValues("outer").latest).toBe(replacement.id);
    });

    it("nested providers forward to parent and inner reports hasParentContext", async () => {
        let innerApi!: ReturnType<typeof useToastsCenterValue>;
        function InnerCapture() {
            innerApi = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <PlainToastsProvider>
                    <Inspector testId="outer" />
                    <PlainToastsProvider>
                        <Inspector testId="inner" />
                        <InnerCapture />
                    </PlainToastsProvider>
                </PlainToastsProvider>
            </IntlProvider>,
        );

        expect(getInspectorValues("outer").hasParent).toBe(false);
        expect(getInspectorValues("inner").hasParent).toBe(true);

        innerApi.addMessage(successMsg());
        await waitFor(() => expect(getInspectorValues("outer").count).toBe(1));
        expect(getInspectorValues("inner").count).toBe(1);
    });

    it("transfers existing child messages to new parent when parent appears", async () => {
        function Wrapper() {
            const [wrapWithParent, setWrapWithParent] = useState(false);

            const ChildTree = (
                <PlainToastsProvider>
                    <Inspector testId="child" />
                    <ChildActor />
                </PlainToastsProvider>
            );

            return (
                <div>
                    <button onClick={() => setWrapWithParent(true)}>mount-parent</button>
                    {wrapWithParent ? (
                        <PlainToastsProvider>
                            <Inspector testId="parent" />
                            {ChildTree}
                        </PlainToastsProvider>
                    ) : (
                        ChildTree
                    )}
                </div>
            );
        }

        let childApi!: ReturnType<typeof useToastsCenterValue>;
        function ChildActor() {
            childApi = ToastsCenterContext.useContextStore((c) => c);
            return null;
        }

        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <Wrapper />
            </IntlProvider>,
        );

        // add message to child only (no parent yet)
        childApi.addMessage(successMsg());
        await waitFor(() => expect(getInspectorValues("child").count).toBe(1));

        // mount parent -> messages should transfer to parent, child cleared
        await userEvent.click(screen.getByText("mount-parent"));
        await waitFor(() => expect(getInspectorValues("parent").count).toBe(1));
        expect(getInspectorValues("child").count).toBe(1);
    });

    it("ToastsCenter renders only once at the topmost provider when nested", async () => {
        // Include actual ToastsCenter components to verify UI remains single instance
        render(
            <IntlProvider locale="en-US" messages={intlMessages}>
                <PlainToastsProvider>
                    <ToastsCenter />
                    <PlainToastsProvider>
                        <ToastsCenter />
                    </PlainToastsProvider>
                </PlainToastsProvider>
            </IntlProvider>,
        );

        // The messages region should be present exactly once
        const regions = await screen.findAllByRole("region", { name: "No messages" });
        expect(regions).toHaveLength(1);
    });
});
