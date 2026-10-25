// (C) 2007-2026 GoodData Corporation

import { type ConnectDropTarget, type DropTargetMonitor } from "@evil-internetmann/react-dnd";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { type MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

import { createStore } from "../../create_store.js";
import { newDecoratedBucket } from "../../models/decorated_bucket.js";
import { addArithmeticMeasure } from "../../store/arithmetic_measures/arithmetic_measures_actions.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";

import { BucketDropTarget, type IBucketDropTargetProps, dropConfig } from "./BucketDropTarget.js";

describe("BucketDropTarget", () => {
    // Every test gets its own store and a spy on its dispatch. Mocking react-redux instead would
    // leak the mocked module into every other test file through the shared module cache, because
    // the suite runs with test isolation turned off.
    let store: ReturnType<typeof createStore>["store"];
    let dispatchSpy: MockInstance;

    beforeEach(() => {
        store = createStore().store;
        dispatchSpy = vi.spyOn(store, "dispatch");
    });

    const baseDefaultProps: IBucketDropTargetProps = {
        bucket: newDecoratedBucket(),
        itemIsAllowedToDrop: () => true,
        connectDropTarget: ((v) => v) as ConnectDropTarget,
    };

    function renderComponent(props: IBucketDropTargetProps) {
        const WithDropContext = withDragDrop(withIntl(BucketDropTarget));

        return render(
            <Provider store={store}>
                <WithDropContext {...props} />
            </Provider>,
        );
    }

    describe("drop zone content", () => {
        // Every accepts combination that a real visualization bucket can present, including the geo
        // augmentation BucketDropTarget adds for the segment bucket. The placeholder and the hover
        // hint are looked up BY THE JOINED ACCEPTS STRING, so a combination without a translation
        // renders the raw message id instead of the invitation.
        const acceptsCombinations: Array<[string, string[]]> = [
            ["view", ["attribute", "date"]],
            ["stack", ["attribute"]],
            ["segment", ["attribute", "geo_attribute"]],
        ];

        it.each(acceptsCombinations)(
            "should render the invitation for the %s bucket instead of a raw message id",
            (localIdentifier, accepts) => {
                const { container } = renderComponent({
                    ...baseDefaultProps,
                    bucket: newDecoratedBucket({ localIdentifier, items: [], itemsLimit: 5, accepts }),
                });

                const invitation = container.querySelector(".adi-bucket-invitation-inner");

                expect(invitation.textContent).not.toContain("dashboard.bucket");
                expect(invitation.textContent).toMatch(/Drag/);
                // a computed attribute is advertised by the attribute icon - it behaves like one
                expect(invitation.querySelectorAll(".attr-field-icon")).toHaveLength(1);
            },
        );
    });

    describe("#render", () => {
        function renderBucket(
            itemsLimit: number,
            items: IDecoratedBucketItem[] = [],
            customProps: Partial<IBucketDropTargetProps> = {},
        ) {
            const defaultProps: IBucketDropTargetProps = {
                ...baseDefaultProps,
                bucket: newDecoratedBucket({
                    localIdentifier: "measures",
                    items,
                    itemsLimit,
                    accepts: ["metric", "fact", "attribute"],
                }),
                ...customProps,
            };

            return renderComponent(defaultProps);
        }

        it("should render and show add measure button when bucket accepts measures and showAddItemButton is true", () => {
            renderBucket(10, [], { showAddItemButton: true });

            expect(document.querySelector(".adi-bucket-add-item-button")).toBeInTheDocument();
            expect(document.querySelector(".adi-bucket-add-item-button-active")).toBeInTheDocument();
        });

        it("should render but not show add button when bucket accepts measures and showAddItemButton is false", () => {
            renderBucket(10, [], { showAddItemButton: false });

            expect(document.querySelector(".adi-bucket-add-item-button")).toBeInTheDocument();
            expect(document.querySelector(".adi-bucket-add-item-button-active")).not.toBeInTheDocument();
        });
    });

    describe("add arithmetic measure item button", () => {
        const defaultProps: IBucketDropTargetProps = {
            ...baseDefaultProps,
            bucket: newDecoratedBucket({ localIdentifier: "stack", items: [], accepts: ["attribute"] }),
        };

        it("should dispatch the addArithmeticMeasure action when the button is clicked", () => {
            renderComponent({ ...defaultProps, showAddItemButton: true });

            fireEvent.click(document.querySelector(".s-bucket-add-arithmetic-measure-button"));

            expect(dispatchSpy).toHaveBeenCalledWith(addArithmeticMeasure("stack"));
        });
    });

    describe("#canDrop", () => {
        const { canDrop } = dropConfig;
        const draggedData = { item: { type: "fact" } };
        const monitor = {
            getItem: () => draggedData,
        } as DropTargetMonitor;

        it("should execute evaluator and return its result", () => {
            const allowedToDrop = vi.fn(() => false);
            const res = canDrop(
                { bucket: baseDefaultProps.bucket, itemIsAllowedToDrop: allowedToDrop },
                monitor,
            );

            expect(res).toEqual(false);
            expect(allowedToDrop).toHaveBeenCalledWith(draggedData);
        });
    });
});
