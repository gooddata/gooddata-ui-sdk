// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemMeasure } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { metricDescriptor as typedMetricDescriptor } from "../../metric/metricDescriptor.js";
import { createTestMetricMutationPort } from "../../metric/tests/metricMutationPort.test.utils.js";
import { AsCodeDetailActions } from "../AsCodeDetailActions.js";
import { type IAsCodeDescriptor, isLoadSeed } from "../descriptor.js";

import { withMutationPort } from "./withMutationPort.js";

// Built from the typed metric descriptor so the stubbed capabilities stay shape-checked.
const metricSeed = typedMetricDescriptor.seed;
if (!isLoadSeed(metricSeed)) {
    throw new Error("a metric seeds via a fetch");
}
const loadedMeasure: IMeasureMetadataObjectDefinition = {
    id: "revenue.total",
    type: "measure",
    title: "Total Revenue",
    description: "",
    tags: [],
    expression: "SELECT 1",
    format: "",
};
const metricDescriptor: IAsCodeDescriptor = withMutationPort(
    {
        ...typedMetricDescriptor,
        seed: { load: async () => loadedMeasure, loadError: metricSeed.loadError },
        referenceCounted: {
            ...typedMetricDescriptor.referenceCounted!,
            count: async () => 0,
        },
    },
    createTestMetricMutationPort(),
);

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        YamlEditor: ({
            initialValue,
            onChange,
        }: {
            initialValue: string;
            onChange?: (v: string) => void;
        }) => (
            <textarea
                data-testid="yaml-editor"
                defaultValue={initialValue}
                onChange={(e) => onChange?.(e.target.value)}
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

const stubBackend = {} as unknown as IAnalyticalBackend;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <BackendProvider backend={stubBackend}>
                <WorkspaceProvider workspace="test-workspace">
                    <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

function renderActions(props: Partial<Parameters<typeof AsCodeDetailActions>[0]> = {}) {
    return render(<AsCodeDetailActions descriptor={metricDescriptor} item={measureItem} {...props} />, {
        wrapper: Wrapper,
    });
}

describe("AsCodeDetailActions (metric)", () => {
    it("renders the Share button and fires onShare when shareable", () => {
        const onShare = vi.fn();
        renderActions({ onOpen: vi.fn(), canShare: true, onShare });

        fireEvent.click(screen.getByRole("button", { name: /^share$/i }));
        expect(onShare).toHaveBeenCalledTimes(1);
    });

    it("hides the Share button when not shareable", () => {
        renderActions({ onOpen: vi.fn(), canShare: false });

        expect(screen.queryByRole("button", { name: /^share$/i })).toBeNull();
    });

    it("offers the standalone open action and calls onOpen when selected", () => {
        const onOpen = vi.fn();
        renderActions({ onOpen });

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        fireEvent.click(screen.getByText("Open in metric editor"));

        expect(onOpen).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ item: measureItem, workspaceId: "test-workspace", newTab: false }),
        );
    });

    it("omits the open action when no onOpen handler is provided", () => {
        renderActions();

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        expect(screen.queryByText("Open in metric editor")).toBeNull();
        expect(screen.getByText("Duplicate")).toBeInTheDocument();
    });

    it("opens the inline edit dialog on Edit click", async () => {
        renderActions({ onOpen: vi.fn() });

        fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

        expect(await screen.findByTestId("yaml-editor")).toBeInTheDocument();
    });

    it("opens the delete confirmation from the menu", async () => {
        renderActions({ onOpen: vi.fn() });

        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        fireEvent.click(screen.getByText("Delete"));

        expect(await screen.findByText("Delete metric")).toBeInTheDocument();
    });

    it("withholds edit and duplicate when the descriptor vetoes the item, keeping delete and open", () => {
        const vetoingDescriptor: IAsCodeDescriptor = { ...metricDescriptor, useIsItemEditable: () => false };
        render(<AsCodeDetailActions descriptor={vetoingDescriptor} item={measureItem} onOpen={vi.fn()} />, {
            wrapper: Wrapper,
        });

        expect(screen.queryByRole("button", { name: /^edit$/i })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
        expect(screen.queryByText("Duplicate")).toBeNull();
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText("Open in metric editor")).toBeInTheDocument();
    });
});
