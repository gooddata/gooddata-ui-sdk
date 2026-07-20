// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAsCodeDescriptor } from "../../asCodeRegistry.js";
import type { ICatalogItemMeasure } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import type { IMetricMutationPort } from "../../metric/metricMutationPort.js";
import { createTestMetricMutationPort } from "../../metric/tests/metricMutationPort.test.utils.js";
import { ObjectTypes } from "../../objectType/constants.js";
import { AsCodeDetailActions } from "../AsCodeDetailActions.js";
import { AsCodeMutationProvider } from "../AsCodeMutationContext.js";

// A metric is the as-code type that exercises every AsCodeDetailActions capability: the standalone
// "open" extra action, a load-backed edit/duplicate, and delete with a referencing-count warning.
const metricDescriptor = getAsCodeDescriptor(ObjectTypes.METRIC)!;

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

// The injected port means the backend is never called, so a bare stub satisfies the provider.
const stubBackend = {} as unknown as IAnalyticalBackend;

function createWrapper(port: IMetricMutationPort = createTestMetricMutationPort()) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={stubBackend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <AsCodeMutationProvider ports={{ [ObjectTypes.METRIC]: port }}>
                                {children}
                            </AsCodeMutationProvider>
                        </ToastsCenterContextProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

function renderActions(props: Partial<Parameters<typeof AsCodeDetailActions>[0]> = {}) {
    return render(<AsCodeDetailActions descriptor={metricDescriptor} item={measureItem} {...props} />, {
        wrapper: createWrapper(),
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
        // The rest of the menu is still present.
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
});
