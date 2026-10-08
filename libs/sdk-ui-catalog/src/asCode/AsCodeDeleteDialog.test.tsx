// (C) 2026 GoodData Corporation

import { type MouseEvent, type PropsWithChildren } from "react";

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
    ICatalogItemRef,
} from "../catalogItem/types.js";
import { createTestComputedAttributeMutationPort } from "../computedAttribute/computedAttributeMutationPort.test.utils.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { createTestMetricMutationPort } from "../metric/metricMutationPort.test.utils.js";
import { ObjectTypes } from "../objectType/constants.js";
import { createTestParameterMutationPort } from "../parameter/parameterMutationPort.test.utils.js";
import { TestPermissionsProvider } from "../permission/TestPermissionsProvider.js";

import { AsCodeDeleteDialog } from "./AsCodeDeleteDialog.js";
import type { IAsCodeDescriptor, IAsCodeReference } from "./descriptor.js";
import { withMutationPort } from "./withMutationPort.js";

const metricDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.METRIC)!,
    createTestMetricMutationPort(),
);
const parameterDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.PARAMETER)!,
    createTestParameterMutationPort(),
);

function metricDescriptorWithReferences(load: () => Promise<IAsCodeReference[]>): IAsCodeDescriptor {
    return {
        ...metricDescriptor,
        usageCheck: { ...metricDescriptor.usageCheck!, load },
    };
}

const computedAttributeDescriptor = withMutationPort(
    getAsCodeDescriptor(ObjectTypes.COMPUTED_ATTRIBUTE)!,
    createTestComputedAttributeMutationPort(),
);

function computedAttributeDescriptorWithReferences(
    load: () => Promise<IAsCodeReference[]>,
): IAsCodeDescriptor {
    return {
        ...computedAttributeDescriptor,
        usageCheck: { ...computedAttributeDescriptor.usageCheck!, load },
    };
}

function parameterDescriptorWithReferences(load: () => Promise<IAsCodeReference[]>): IAsCodeDescriptor {
    return {
        ...parameterDescriptor,
        usageCheck: { ...parameterDescriptor.usageCheck!, load },
    };
}

function referencesTitled(...titles: string[]) {
    return titles.map((title) => ({ identifier: title, type: "insight" as const, title }));
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
        let resolveLookup: (references: IAsCodeReference[]) => void = () => {};
        renderMetric(
            metricDescriptorWithReferences(
                () =>
                    new Promise<IAsCodeReference[]>((resolve) => {
                        resolveLookup = resolve;
                    }),
            ),
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
        resolveLookup([]);
        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("shows only the checking text until the usage lookup resolves", async () => {
        let resolveLookup: (references: IAsCodeReference[]) => void = () => {};
        renderMetric(
            metricDescriptorWithReferences(
                () =>
                    new Promise<IAsCodeReference[]>((resolve) => {
                        resolveLookup = resolve;
                    }),
            ),
        );

        expect(screen.getByText("Checking where it is used…")).toBeInTheDocument();
        expect(screen.queryByText(/Are you sure/)).toBeNull();
        resolveLookup([]);
        expect(await screen.findByText(/Are you sure/)).toBeInTheDocument();
        expect(screen.queryByText("Checking where it is used…")).toBeNull();
    });

    it("surfaces the dependent-object warning once the usage lookup resolves", async () => {
        renderMetric(
            metricDescriptorWithReferences(vi.fn().mockResolvedValue(referencesTitled("A", "B", "C"))),
        );

        expect(await screen.findByText(/used by 3 objects/)).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("does not list the referencing objects in warn mode", async () => {
        renderMetric(
            metricDescriptorWithReferences(vi.fn().mockResolvedValue(referencesTitled("A", "B", "C"))),
        );

        await screen.findByText(/used by 3 objects/);
        expect(screen.queryByText("Show more")).toBeNull();
        expect(screen.queryByText("A")).toBeNull();
    });

    it("allows the deletion and offers a retry when the usage lookup fails", async () => {
        renderMetric(metricDescriptorWithReferences(vi.fn().mockRejectedValue(new Error("lookup failed"))));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Could not check where this object is used.",
        );
        expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("shows the dependent-object warning when a retried lookup succeeds", async () => {
        const load = vi
            .fn()
            .mockRejectedValueOnce(new Error("lookup failed"))
            .mockResolvedValueOnce(referencesTitled("A", "B"));
        renderMetric(metricDescriptorWithReferences(load));

        fireEvent.click(await screen.findByText("Try again"));

        expect(await screen.findByText(/used by 2 objects/)).toBeInTheDocument();
        expect(screen.queryByText("Could not check where this object is used.")).toBeNull();
    });
});

describe("AsCodeDeleteDialog with a blocking referencing lookup (computed attribute)", () => {
    function renderComputedAttribute(
        descriptor: IAsCodeDescriptor,
        onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void,
    ) {
        return render(
            <AsCodeDeleteDialog
                descriptor={descriptor}
                item={computedAttributeItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
                onCatalogItemNavigation={onCatalogItemNavigation}
            />,
            { wrapper: Wrapper },
        );
    }

    it("refuses the deletion and explains why while a visualization still references it", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue(referencesTitled("Rep performance")),
            ),
        );

        expect(
            await screen.findByText(
                /cannot be deleted because it is used in some visualizations, metrics, dashboards, or data filters/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("1 object")).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
    });

    it("discloses the referencing objects behind the Show more toggle", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue(referencesTitled("Rep performance", "Won by band", "Pipeline")),
            ),
        );

        expect(await screen.findByText("3 objects")).toBeInTheDocument();
        expect(screen.queryByText("Rep performance")).toBeNull();

        const showMore = await screen.findByRole("button", { name: "Show more" });
        expect(showMore).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(showMore);

        expect(screen.getByText("Rep performance")).toBeInTheDocument();
        expect(screen.getByText("Pipeline")).toBeInTheDocument();

        const showLess = await screen.findByRole("button", { name: "Show less" });
        expect(showLess).toHaveAttribute("aria-expanded", "true");
        fireEvent.click(showLess);

        expect(screen.queryByText("Rep performance")).toBeNull();
    });

    it("groups the referencing objects by type in the catalog filter order", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue([
                    { identifier: "udf.a", type: "userDataFilter", title: "Region filter" },
                    { identifier: "viz.a", type: "insight", title: "Revenue" },
                    { identifier: "viz.b", type: "insight", title: "Pipeline" },
                    { identifier: "dash.a", type: "analyticalDashboard", title: "Sales dashboard" },
                ]),
            ),
        );

        fireEvent.click(await screen.findByText("Show more"));

        const dashboards = screen.getByText("Dashboards (1)");
        const visualizations = screen.getByText("Visualizations (2)");
        const otherObjects = screen.getByText("Other objects (1)");
        expect(dashboards.compareDocumentPosition(visualizations)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(screen.getByText("Pipeline").compareDocumentPosition(otherObjects)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(otherObjects.compareDocumentPosition(screen.getByText("Region filter"))).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
    });

    it("lists each referencing object even when two share a title", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue([
                    { identifier: "viz.a", type: "insight", title: "Revenue" },
                    { identifier: "viz.b", type: "insight", title: "Revenue" },
                ]),
            ),
        );

        fireEvent.click(await screen.findByText("Show more"));

        expect(screen.getAllByText("Revenue")).toHaveLength(2);
        expect(consoleError).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });

    it("opens a referencing catalog object from the list", async () => {
        const onCatalogItemNavigation = vi.fn();
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(
                vi.fn().mockResolvedValue([
                    { identifier: "viz.a", type: "insight", title: "Revenue" },
                    { identifier: "udf.a", type: "userDataFilter", title: "Region filter" },
                ]),
            ),
            onCatalogItemNavigation,
        );

        fireEvent.click(await screen.findByText("Show more"));
        fireEvent.click(await screen.findByRole("button", { name: "Revenue" }));

        expect(onCatalogItemNavigation).toHaveBeenCalledWith(expect.anything(), {
            identifier: "viz.a",
            type: "insight",
        });
        expect(screen.getByText("Region filter").closest("button")).toBeNull();
    });

    it("lists the referencing objects as plain text when navigation is not handled", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(vi.fn().mockResolvedValue(referencesTitled("Revenue"))),
        );

        fireEvent.click(await screen.findByText("Show more"));

        expect(screen.getByText("Revenue").closest("button")).toBeNull();
    });

    it("allows the deletion when nothing references it", async () => {
        renderComputedAttribute(computedAttributeDescriptorWithReferences(vi.fn().mockResolvedValue([])));

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
        expect(screen.queryByText(/cannot be deleted/)).toBeNull();
    });

    it("refuses the deletion and offers a retry when the lookup fails", async () => {
        renderComputedAttribute(
            computedAttributeDescriptorWithReferences(vi.fn().mockRejectedValue(new Error("lookup failed"))),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Could not check where this object is used.",
        );
        expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
    });
});

describe("AsCodeDeleteDialog with a blocking referencing lookup (parameter)", () => {
    function renderParameter(descriptor: IAsCodeDescriptor) {
        return render(
            <AsCodeDeleteDialog
                descriptor={descriptor}
                item={parameterItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );
    }

    it("keeps the delete action disabled until the usage lookup resolves", async () => {
        let resolveLookup: (references: IAsCodeReference[]) => void = () => {};
        renderParameter(
            parameterDescriptorWithReferences(
                () =>
                    new Promise<IAsCodeReference[]>((resolve) => {
                        resolveLookup = resolve;
                    }),
            ),
        );

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
        resolveLookup([]);
        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("refuses the deletion and explains why while a metric still references it", async () => {
        renderParameter(
            parameterDescriptorWithReferences(vi.fn().mockResolvedValue(referencesTitled("Rep performance"))),
        );

        expect(
            await screen.findByText(
                /cannot be deleted because it is used in some metrics, attributes, visualizations, or dashboards/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("1 object")).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");
    });

    it("lists the referencing objects behind the Show more toggle", async () => {
        renderParameter(
            parameterDescriptorWithReferences(
                vi.fn().mockResolvedValue(referencesTitled("Top N revenue", "Top N dashboard")),
            ),
        );

        fireEvent.click(await screen.findByText("Show more"));

        expect(screen.getByText("Top N revenue")).toBeInTheDocument();
        expect(screen.getByText("Top N dashboard")).toBeInTheDocument();
    });

    it("asks for confirmation and allows the deletion when nothing references it", async () => {
        renderParameter(parameterDescriptorWithReferences(vi.fn().mockResolvedValue([])));

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        expect(screen.queryByText(/cannot be deleted/)).toBeNull();
    });
});
