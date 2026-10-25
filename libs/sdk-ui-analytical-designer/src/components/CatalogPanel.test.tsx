// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ConnectDropTarget, type DropTargetMonitor } from "@evil-internetmann/react-dnd";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { DATE } from "../constants/bucket.js";
import { FILTER_ITEM } from "../constants/drag_item_types.js";
import { type IDragFilterItem } from "../typings/drag_and_drop.js";
import { withDragDrop } from "../utils/with_drag_drop_context.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { CatalogPanelBase, type ICatalogPanelProps, dropConfig } from "./CatalogPanel.js";

vi.hoisted(() => {
    vi.resetModules();
});

describe("Catalog Panel", () => {
    const backend = dummyBackend();
    const workspace = "test-workspace";

    const defaultProps: ICatalogPanelProps = {
        canUserManageMetric: false,
        canUserCreateMetric: false,
        isEmbeddedMode: false,
        projectId: "N/A",
        connectDropTarget: ((v) => v) as ConnectDropTarget,
        onDropBucketItem: (v) => v,
        onDropFilterItem: (v) => v,
        isDragging: false,
        isOver: false,
        noData: false,
        isEnhancedInsightPickerEnabled: false,
    };
    const WrappedCatalog = withDragDrop(withRedux(withIntl(CatalogPanelBase)));

    const renderComponent = (customProps: Partial<ICatalogPanelProps>) =>
        render(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <WrappedCatalog {...defaultProps} {...customProps} />
                </WorkspaceProvider>
            </BackendProvider>,
        );

    describe("#isDragging", () => {
        // catalog would loose scroll position
        it("should keep both CatalogList and Trash in DOM", () => {
            const props: Partial<ICatalogPanelProps> = { isDragging: true };
            const { container } = renderComponent(props);

            expect(container.querySelectorAll(".s-trash")).toHaveLength(1);
            expect(container.querySelectorAll(".s-organized-catalog")).toHaveLength(1);
        });

        it("should display trash when dragging bucket item", () => {
            const props = { isDragging: true };
            const { container } = renderComponent(props);

            const catalogPanel = container.querySelector(".adi-catalog-panel");
            const trash = container.querySelector(".adi-trash-panel");

            expect(catalogPanel.className).toContain("transparent");
            expect(trash.className).not.toContain("invisible");
        });

        it("should display catalog when not dragging bucket item", () => {
            const props = { isDragging: false };
            const { container } = renderComponent(props);

            const catalogPanel = container.querySelector(".adi-catalog-panel");
            const trash = container.querySelector(".adi-trash-panel");

            expect(catalogPanel.className).not.toContain("transparent");
            expect(trash.className).toContain("invisible");
        });
    });

    describe("#isOver", () => {
        // catalog would loose scroll position
        it("should add hover class to trash", () => {
            const props = { isDragging: true, isOver: true };
            const { container } = renderComponent(props);

            expect(container.querySelector(".s-adi-droppable-hover")).toBeInTheDocument();
        });
    });

    describe("#drop", () => {
        const { drop } = dropConfig;

        it("should provide onDropBucketItem with item from dragged data", () => {
            const bucketItem = { isFilter: false };

            const onDropBucketItem = vi.fn();

            const monitor = {
                getItem: () => ({ bucketItem }),
            } as DropTargetMonitor;

            drop({ ...defaultProps, onDropBucketItem }, monitor);

            expect(onDropBucketItem).toHaveBeenCalledWith(bucketItem, undefined, undefined);
        });

        it("should provide onDropFilterItem with item from dragged data", () => {
            const onDropFilterItem = vi.fn();
            const filter: IDragFilterItem = {
                itemType: DATE,
                itemLocalIdentifier: "d1",
                dragItemType: FILTER_ITEM,
                renderDraggedItemElement: (v?: ReactElement) => v,
            };

            const monitor = {
                getItem: () => ({ ...filter }),
            } as DropTargetMonitor;

            drop({ ...defaultProps, onDropFilterItem }, monitor);

            expect(onDropFilterItem).toHaveBeenCalledWith("d1", DATE);
        });
    });

    describe("Create calculated measure link", () => {
        it("should render the button link when not in embedded mode and user is allowed to manage metrics", () => {
            const { container } = renderComponent({ canUserManageMetric: true, isEmbeddedMode: false });
            expect(container.querySelector(".s-btn-create_calculated_measure")).toBeInTheDocument();
        });

        it("should not render the button link when in embedded mode even thought the user is allowed to manage metrics", () => {
            const { container } = renderComponent({ canUserManageMetric: true, isEmbeddedMode: true });
            expect(container.querySelector(".s-btn-create_calculated_measure")).not.toBeInTheDocument();
        });

        it("should not render the button link when the user is not allowed to manage metrics", () => {
            const { container } = renderComponent({ canUserManageMetric: false, isEmbeddedMode: false });
            expect(container.querySelector(".s-btn-create_calculated_measure")).not.toBeInTheDocument();
        });
    });

    describe("Create metric button", () => {
        it("should render the button when the user is allowed to create metrics", () => {
            const { container } = renderComponent({ canUserCreateMetric: true });
            expect(container.querySelector(".adi-catalog-create_metric_button")).toBeInTheDocument();
        });

        it("should not render the button when the user is not allowed to create metrics", () => {
            const { container } = renderComponent({ canUserCreateMetric: false });
            expect(container.querySelector(".adi-catalog-create_metric_button")).not.toBeInTheDocument();
        });
    });
});
