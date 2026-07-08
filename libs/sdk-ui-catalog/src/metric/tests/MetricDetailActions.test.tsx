// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemMeasure } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { MetricDetailActions } from "../MetricDetailActions.js";
import { MetricMutationProvider } from "../MetricMutationContext.js";
import type { IMetricMutationPort } from "../metricMutationPort.js";

import { createTestMetricMutationPort } from "./metricMutationPort.test.utils.js";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        SyntaxHighlightingInput: ({
            value,
            onChange,
            disabled,
        }: {
            value: string;
            onChange: (value: string) => void;
            disabled?: boolean;
        }) => (
            <textarea
                data-testid="yaml-editor"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
    };
});

const measureItem: ICatalogItemMeasure = {
    identifier: "revenue.total",
    type: "measure",
    title: "Total Revenue",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    format: "",
};

function createWrapper(port: IMetricMutationPort = createTestMetricMutationPort()) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <WorkspaceProvider workspace="test-workspace">
                    <ToastsCenterContextProvider>
                        <MetricMutationProvider port={port}>{children}</MetricMutationProvider>
                    </ToastsCenterContextProvider>
                </WorkspaceProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

describe("MetricDetailActions", () => {
    it("renders the Share button and fires onShare when shareable", () => {
        const onShare = vi.fn();
        render(<MetricDetailActions item={measureItem} onOpen={vi.fn()} canShare onShare={onShare} />, {
            wrapper: createWrapper(),
        });

        fireEvent.click(screen.getByRole("button", { name: /^share$/i }));
        expect(onShare).toHaveBeenCalledTimes(1);
    });

    it("hides the Share button when not shareable", () => {
        render(<MetricDetailActions item={measureItem} onOpen={vi.fn()} canShare={false} />, {
            wrapper: createWrapper(),
        });

        expect(screen.queryByRole("button", { name: /^share$/i })).toBeNull();
    });

    it("offers Open in metric editor and calls onOpen when selected", () => {
        const onOpen = vi.fn();
        render(<MetricDetailActions item={measureItem} onOpen={onOpen} />, { wrapper: createWrapper() });

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        fireEvent.click(screen.getByText("Open in metric editor"));

        expect(onOpen).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ item: measureItem, workspaceId: "test-workspace", newTab: false }),
        );
    });

    it("omits Open in metric editor when no onOpen handler is provided", () => {
        render(<MetricDetailActions item={measureItem} />, { wrapper: createWrapper() });

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        expect(screen.queryByText("Open in metric editor")).toBeNull();
        // The rest of the menu is still present.
        expect(screen.getByText("Duplicate")).toBeInTheDocument();
    });

    it("opens the inline edit dialog on Edit click", async () => {
        render(<MetricDetailActions item={measureItem} onOpen={vi.fn()} />, { wrapper: createWrapper() });

        fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

        expect(await screen.findByTestId("yaml-editor")).toBeInTheDocument();
    });

    it("opens the delete confirmation from the menu", async () => {
        render(<MetricDetailActions item={measureItem} onOpen={vi.fn()} />, { wrapper: createWrapper() });

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        fireEvent.click(screen.getByText("Delete"));

        expect(await screen.findByText("Delete metric")).toBeInTheDocument();
    });
});
