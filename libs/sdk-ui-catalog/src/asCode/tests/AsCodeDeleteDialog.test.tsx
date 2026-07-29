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
import type { IAsCodeDescriptor } from "../descriptor.js";

import { withMutationPort } from "./withMutationPort.js";

const metricDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.METRIC)!,
    createTestMetricMutationPort(),
);
const parameterDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.PARAMETER)!,
    createTestParameterMutationPort(),
);

function metricDescriptorWithCount(count: () => Promise<number>): IAsCodeDescriptor {
    return {
        ...metricDescriptor,
        referenceCounted: { ...metricDescriptor.referenceCounted!, count },
    };
}

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

// ConfirmDialog marks disabled via `aria-disabled` (not the native prop) and may nest the label in a span.
function getDeleteButton(): HTMLButtonElement {
    return screen.getByText("Delete", { selector: "button span, button" }).closest("button")!;
}

describe("AsCodeDeleteDialog with a referencing-count lookup (metric)", () => {
    function renderMetric(descriptor: IAsCodeDescriptor) {
        return render(
            <AsCodeDeleteDialog
                descriptor={descriptor}
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
            metricDescriptorWithCount(
                () =>
                    new Promise<number>((resolve) => {
                        resolveLookup = resolve;
                    }),
            ),
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
        resolveLookup(0);
        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("surfaces the dependent-object warning once the usage lookup resolves", async () => {
        renderMetric(metricDescriptorWithCount(vi.fn().mockResolvedValue(3)));

        expect(await screen.findByText(/used by 3 objects/)).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("re-enables the delete action when the usage lookup fails so a failed lookup never traps the user", async () => {
        renderMetric(metricDescriptorWithCount(vi.fn().mockRejectedValue(new Error("lookup failed"))));

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });
});

describe("AsCodeDeleteDialog without a referencing-count lookup (parameter)", () => {
    it("enables the delete action immediately and shows no usage warning", () => {
        render(
            <AsCodeDeleteDialog
                descriptor={parameterDescriptor}
                item={parameterItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
        expect(screen.queryByText(/used by/)).toBeNull();
    });
});
