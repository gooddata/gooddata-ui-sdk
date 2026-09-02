// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAsCodeDescriptor } from "../asCodeRegistry.js";
import type {
    ICatalogItemComputedAttribute,
    ICatalogItemMeasure,
    ICatalogItemParameter,
} from "../catalogItem/types.js";
import { createTestComputedAttributeMutationPort } from "../computedAttribute/computedAttributeMutationPort.test.utils.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { createTestMetricMutationPort } from "../metric/metricMutationPort.test.utils.js";
import { ObjectTypes } from "../objectType/constants.js";
import { createTestParameterMutationPort } from "../parameter/parameterMutationPort.test.utils.js";
import { TestPermissionsProvider } from "../permission/TestPermissionsProvider.js";

import { AsCodeDeleteDialog } from "./AsCodeDeleteDialog.js";
import type { IAsCodeDescriptor } from "./descriptor.js";
import { withMutationPort } from "./withMutationPort.js";

const metricDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.METRIC)!,
    createTestMetricMutationPort(),
);
const parameterDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.PARAMETER)!,
    createTestParameterMutationPort(),
);

function metricDescriptorWithReferences(load: () => Promise<string[]>): IAsCodeDescriptor {
    return {
        ...metricDescriptor,
        referenceCounted: { ...metricDescriptor.referenceCounted!, load },
    };
}

const computedAttributeDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.COMPUTED_ATTRIBUTE)!,
    createTestComputedAttributeMutationPort(),
);

function computedAttributeDescriptorWithReferences(load: () => Promise<string[]>): IAsCodeDescriptor {
    return {
        ...computedAttributeDescriptor,
        referenceCounted: { ...computedAttributeDescriptor.referenceCounted!, load },
    };
}

const stubBackend = {} as unknown as IAnalyticalBackend;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <BackendProvider backend={stubBackend}>
                <WorkspaceProvider workspace="test-workspace">
                    <TestPermissionsProvider>
                        <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                    </TestPermissionsProvider>
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

const computedAttributeItem: ICatalogItemComputedAttribute = {
    identifier: "rep_performance",
    type: "computedAttribute",
    title: "Rep Performance",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
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
        let resolveLookup: (titles: string[]) => void = () => {};
        renderMetric(
            metricDescriptorWithReferences(
                () =>
                    new Promise<string[]>((resolve) => {
                        resolveLookup = resolve;
                    }),
            ),
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
        resolveLookup([]);
        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("surfaces the dependent-object warning once the usage lookup resolves", async () => {
        renderMetric(metricDescriptorWithReferences(vi.fn().mockResolvedValue(["A", "B", "C"])));

        expect(await screen.findByText(/used by 3 objects/)).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("does not disclose the referencing objects for a type that does not opt in", async () => {
        renderMetric(metricDescriptorWithReferences(vi.fn().mockResolvedValue(["A", "B", "C"])));

        await screen.findByText(/used by 3 objects/);
        expect(screen.queryByText("Show more")).toBeNull();
        expect(screen.queryByText("A")).toBeNull();
    });

    it("re-enables the delete action when the usage lookup fails so a failed lookup never traps the user", async () => {
        renderMetric(metricDescriptorWithReferences(vi.fn().mockRejectedValue(new Error("lookup failed"))));

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });
});

describe("AsCodeDeleteDialog with a blocking referencing lookup (computed attribute)", () => {
    function renderComputedAttribute(descriptor: IAsCodeDescriptor) {
        return render(
            <AsCodeDeleteDialog
                descriptor={descriptor}
                item={computedAttributeItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );
    }

    it("refuses the deletion and explains why while a visualization still references it", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(vi.fn().mockResolvedValue(["Rep performance"])),
        );

        expect(
            await screen.findByText(
                /cannot be deleted because it is used in some visualizations, metrics, or dashboards/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("1 object")).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
    });

    it("discloses the referencing objects behind the Show more toggle", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue(["Rep performance", "Won by band", "Pipeline"]),
            ),
        );

        expect(await screen.findByText("3 objects")).toBeInTheDocument();
        expect(screen.queryByText("Rep performance")).toBeNull();

        fireEvent.click(screen.getByText("Show more"));

        expect(screen.getByText("Rep performance")).toBeInTheDocument();
        expect(screen.getByText("Pipeline")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Show less"));

        expect(screen.queryByText("Rep performance")).toBeNull();
    });

    it("allows the deletion when nothing references it", async () => {
        renderComputedAttribute(computedAttributeDescriptorWithReferences(vi.fn().mockResolvedValue([])));

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
        expect(screen.queryByText(/cannot be deleted/)).toBeNull();
    });

    it("allows the deletion when the lookup fails, leaving the refusal to the backend", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(vi.fn().mockRejectedValue(new Error("lookup failed"))),
        );

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
