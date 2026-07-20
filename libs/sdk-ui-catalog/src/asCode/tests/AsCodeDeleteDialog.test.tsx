// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAsCodeDescriptor } from "../../asCodeRegistry.js";
import type { ICatalogItemMeasure, ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { createTestMetricMutationPort } from "../../metric/tests/metricMutationPort.test.utils.js";
import { ObjectTypes } from "../../objectType/constants.js";
import { createTestParameterMutationPort } from "../../parameter/tests/parameterMutationPort.test.utils.js";
import { AsCodeDeleteDialog } from "../AsCodeDeleteDialog.js";
import { AsCodeMutationProvider } from "../AsCodeMutationContext.js";

const metricDescriptor = getAsCodeDescriptor(ObjectTypes.METRIC)!;
const parameterDescriptor = getAsCodeDescriptor(ObjectTypes.PARAMETER)!;

// The injected port means the backend is never called, so a bare stub satisfies the provider.
const stubBackend = {} as unknown as IAnalyticalBackend;

const measureItem: ICatalogItemMeasure = {
    identifier: "metric.id",
    type: "measure",
    title: "My Metric",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    format: "#,##0.00",
};

const parameterItem: ICatalogItemParameter = {
    identifier: "param.id",
    type: "parameter",
    title: "My Param",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 0 },
};

// ConfirmDialog may nest the submit label in a span and marks the button disabled via `aria-disabled`
// rather than the native `disabled` property, so it is located by label text and its disabled state is
// asserted from that attribute.
function getDeleteButton(): HTMLButtonElement {
    return screen.getByText("Delete", { selector: "button span, button" }).closest("button")!;
}

describe("AsCodeDeleteDialog with a referencing-count lookup (metric)", () => {
    function renderMetric(port = createTestMetricMutationPort()) {
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <TestIntlProvider>
                    <BackendProvider backend={stubBackend}>
                        <WorkspaceProvider workspace="test-workspace">
                            <ToastsCenterContextProvider>
                                <AsCodeMutationProvider
                                    ports={{
                                        [ObjectTypes.METRIC]: port,
                                    }}
                                >
                                    {children}
                                </AsCodeMutationProvider>
                            </ToastsCenterContextProvider>
                        </WorkspaceProvider>
                    </BackendProvider>
                </TestIntlProvider>
            );
        }
        return render(
            <AsCodeDeleteDialog
                descriptor={metricDescriptor}
                item={measureItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );
    }

    it("keeps the delete action disabled until the usage lookup resolves", async () => {
        let resolveLookup: (count: number) => void = () => {};
        renderMetric(
            createTestMetricMutationPort({
                getReferencingObjectsCount: vi.fn().mockReturnValue(
                    new Promise<number>((resolve) => {
                        resolveLookup = resolve;
                    }),
                ),
            }),
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
        resolveLookup(0);
        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("surfaces the dependent-object warning once the usage lookup resolves", async () => {
        renderMetric(
            createTestMetricMutationPort({ getReferencingObjectsCount: vi.fn().mockResolvedValue(3) }),
        );

        expect(await screen.findByText(/used by 3 objects/)).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("re-enables the delete action when the usage lookup fails so a failed lookup never traps the user", async () => {
        renderMetric(
            createTestMetricMutationPort({
                getReferencingObjectsCount: vi.fn().mockRejectedValue(new Error("lookup failed")),
            }),
        );

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });
});

describe("AsCodeDeleteDialog without a referencing-count lookup (parameter)", () => {
    it("enables the delete action immediately and shows no usage warning", () => {
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <TestIntlProvider>
                    <BackendProvider backend={stubBackend}>
                        <WorkspaceProvider workspace="test-workspace">
                            <ToastsCenterContextProvider>
                                <AsCodeMutationProvider
                                    ports={{
                                        [ObjectTypes.PARAMETER]: createTestParameterMutationPort(),
                                    }}
                                >
                                    {children}
                                </AsCodeMutationProvider>
                            </ToastsCenterContextProvider>
                        </WorkspaceProvider>
                    </BackendProvider>
                </TestIntlProvider>
            );
        }
        render(
            <AsCodeDeleteDialog
                descriptor={parameterDescriptor}
                item={parameterItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        // A type with no usage lookup is never withheld, and offers no dependent-object warning.
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
        expect(screen.queryByText(/used by/)).toBeNull();
    });
});
