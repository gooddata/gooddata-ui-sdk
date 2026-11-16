// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FocusHandoffContext, type IFocusHandoff, createFocusHandoff } from "../../shared/focusHandoff.js";
import { TabsClasses } from "../../shared/Tabs/Tabs.classes.js";
import { Tabs } from "../../shared/Tabs/Tabs.js";
import { mountWithIntlComponent } from "../../tests/render.test.utils.js";

import { MinimizedMetricComponent } from "./MinimizedMetricComponent.js";

// The handoff expires in a timeout. Only timeouts are faked: Tabs polls its size in an endless
// requestAnimationFrame loop, which faked timers would run until they give up.
const fakeTimeoutsOnly = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

describe("MinimizedMetricComponent", () => {
    describe("rendering", () => {
        it("render with 2 metrics and try handlers", async () => {
            const onClose = vi.fn();
            const onExpand = vi.fn();
            const { container } = mountWithIntlComponent(
                <MinimizedMetricComponent
                    onClose={onClose}
                    onExpand={onExpand}
                    visible
                    edited={2}
                    where="inline"
                />,
            );

            expect(container).not.toBeNull();
            expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
            expect(container.textContent).toContain("Editing");
            expect(container.textContent).toContain("2 metrics");

            const labelElement = container.querySelector("label");
            expect(labelElement).not.toBeNull();
            if (labelElement) {
                fireEvent.click(labelElement);
            }
            expect(onClose).not.toHaveBeenCalled();
            expect(onExpand).toHaveBeenCalledTimes(1);

            const buttons = container.querySelectorAll("button");
            fireEvent.click(buttons[0]);
            expect(onClose).not.toHaveBeenCalled();
            expect(onExpand).toHaveBeenCalledTimes(2);

            fireEvent.click(buttons[1]);
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onExpand).toHaveBeenCalledTimes(2);
        });

        it("render with 1 metric", async () => {
            const onClose = vi.fn();
            const onExpand = vi.fn();
            const { container } = mountWithIntlComponent(
                <MinimizedMetricComponent
                    onClose={onClose}
                    onExpand={onExpand}
                    visible
                    edited={1}
                    where="inline"
                />,
            );

            expect(container).not.toBeNull();
            expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
            expect(container.textContent).toContain("Editing");
            expect(container.textContent).toContain("1 metric");
        });

        it("render with 1 metric in viewing", async () => {
            const onClose = vi.fn();
            const onExpand = vi.fn();
            const { container } = mountWithIntlComponent(
                <MinimizedMetricComponent
                    editable={false}
                    onClose={onClose}
                    onExpand={onExpand}
                    visible
                    edited={1}
                    where="inline"
                />,
            );

            expect(container).not.toBeNull();
            expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
            expect(container.textContent).toContain("Viewing");
            expect(container.textContent).toContain("1 metric");
        });

        it("render with visible false", async () => {
            const onClose = vi.fn();
            const onExpand = vi.fn();
            const { container } = mountWithIntlComponent(
                <MinimizedMetricComponent
                    onClose={onClose}
                    onExpand={onExpand}
                    visible={false}
                    edited={2}
                    where="inline"
                />,
            );

            expect(container).not.toBeNull();
            expect(container.querySelectorAll("div").length).toBe(0);
        });

        it("render with zero metrics", async () => {
            const onClose = vi.fn();
            const onExpand = vi.fn();
            const { container } = mountWithIntlComponent(
                <MinimizedMetricComponent
                    onClose={onClose}
                    onExpand={onExpand}
                    visible
                    edited={0}
                    where="inline"
                />,
            );

            expect(container).not.toBeNull();
            expect(container.querySelectorAll("div").length).toBe(0);
        });
    });

    describe("focus handoff", () => {
        afterEach(() => {
            vi.useRealTimers();
            (document.activeElement as HTMLElement | null)?.blur();
        });

        const restoreButton = (container: HTMLElement) =>
            container.querySelector<HTMLButtonElement>(".s-edit_dialog-minimized-expand");

        function mountChip(handoff: IFocusHandoff | null, onExpand?: () => void) {
            return mountWithIntlComponent(
                <FocusHandoffContext.Provider value={handoff}>
                    <MinimizedMetricComponent visible edited={1} onExpand={onExpand} />
                </FocusHandoffContext.Provider>,
            );
        }

        it("focuses the restore button when minimizing its editor dropped the focus", () => {
            const handoff = createFocusHandoff();
            handoff.handOff("chip");

            const { container } = mountChip(handoff);

            expect(document.activeElement).toBe(restoreButton(container));
        });

        it("leaves the focus on the page when the chip appears without minimizing", () => {
            expect(document.activeElement).toBe(document.body);

            const { container } = mountChip(createFocusHandoff());

            expect(document.activeElement).toBe(document.body);
            expect(document.activeElement).not.toBe(restoreButton(container));
        });

        it("leaves the focus where it is when another control has it", () => {
            const handoff = createFocusHandoff();
            handoff.handOff("chip");
            const other = document.createElement("button");
            document.body.appendChild(other);
            other.focus();

            mountChip(handoff);

            expect(document.activeElement).toBe(other);
            other.remove();
        });

        it("ignores the handoff of another editor instance", () => {
            createFocusHandoff().handOff("chip");

            const { container } = mountChip(createFocusHandoff());

            expect(document.activeElement).not.toBe(restoreButton(container));
        });

        it("ignores an unconsumed handoff of a minimize that did not happen", () => {
            fakeTimeoutsOnly();
            const handoff = createFocusHandoff();

            // The editor minimizes with the focus inside, but nothing unmounts it (no onTabsMinimize),
            // so no chip takes the record then.
            const editor = render(
                <FocusHandoffContext.Provider value={handoff}>
                    <Tabs active={0} tabs={[{ id: "id-1", title: "Tab", data: undefined }]} minimizable />
                </FocusHandoffContext.Provider>,
            );
            const minimize = editor.container.querySelector<HTMLButtonElement>(
                `.${TabsClasses.ButtonMinimize}`,
            )!;
            minimize.focus();
            fireEvent.click(minimize);
            vi.runAllTimers();
            editor.unmount();

            // A chip that appears later, while the page has the focus, leaves it there.
            expect(document.activeElement).toBe(document.body);
            const { container } = mountChip(handoff);

            expect(document.activeElement).toBe(document.body);
            expect(document.activeElement).not.toBe(restoreButton(container));
        });

        it("hands the focus off to the editor when restoring from the focused chip", () => {
            const handoff = createFocusHandoff();
            const onExpand = vi.fn();
            const { container } = mountChip(handoff, onExpand);
            const button = restoreButton(container)!;

            button.focus();
            fireEvent.click(button);

            expect(onExpand).toHaveBeenCalledTimes(1);
            expect(handoff.take("editor")).toBe(true);
        });

        it("cancels the handoff to the editor when restoring leaves the chip mounted", () => {
            fakeTimeoutsOnly();
            const handoff = createFocusHandoff();
            const { container } = mountChip(handoff, () => {});
            const button = restoreButton(container)!;

            button.focus();
            fireEvent.click(button);
            vi.runAllTimers();

            expect(handoff.take("editor")).toBe(false);
        });
    });
});
