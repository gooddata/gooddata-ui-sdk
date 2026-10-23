// (C) 2007-2026 GoodData Corporation

import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mountWithIntlComponent } from "../../tests/render.test.utils.js";

import { MinimizedMetricComponent } from "./MinimizedMetricComponent.js";

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
});
