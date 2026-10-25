// (C) 2007-2026 GoodData Corporation

import { type ConnectDropTarget, type DropTargetMonitor } from "@evil-internetmann/react-dnd";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BUCKET_ITEM, CATALOG_LIST_ITEM } from "../../constants/drag_item_types.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { newDecoratedBucket } from "../../models/decorated_bucket.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IAppState } from "../../store/types.js";
import {
    categoriesBucketItems,
    measureBucketItems,
    setupAppStateWithDateDatasetMeta,
} from "../../tests/constants.test.helpers.js";
import { createDecoratedBucketMock } from "../../tests/decorated_bucket.test.helpers.js";
import { type IDecoratedBucket, type IDecoratedBucketItem, type IRawBucket } from "../../typings/buckets.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import {
    type IBucketItemDropHandlers,
    type IBucketItemProps,
    BucketItem as Target,
    dropConfig,
} from "./BucketItem.js";
import { BucketItemPure } from "./BucketItemPure.js";

describe("BucketItem", () => {
    describe("Component", () => {
        let decoratedBucket: IDecoratedBucket;
        let bucket: IRawBucket;

        const Wrapped = withRedux(withDragDrop(withIntl(BucketItemPure)), (state: IAppState) =>
            setupAppStateWithDateDatasetMeta(state),
        );

        function renderComponent(item: IDecoratedBucketItem) {
            return render(<Wrapped bucketItem={item} localIdentifier={"measures"} />);
        }

        beforeEach(() => {
            bucket = {
                localIdentifier: "mixed",
                items: [buildBucketItem(measureBucketItems[0]), buildBucketItem(categoriesBucketItems[0])],
            };

            const buckets = [bucket];
            decoratedBucket = createDecoratedBucketMock(buckets);
        });

        it("renders metric as expandable", () => {
            renderComponent(decoratedBucket.items[0]);
            expect(document.querySelector(".collapsed")).toBeInTheDocument();
        });
    });

    describe("#drop", () => {
        const original = { localIdentifier: "localIdentifier", attribute: "id" };
        const item = newDecoratedBucketItem({
            original,
            attribute: {
                title: "title",
                type: "title",
            },
        });
        const defaultProps: IBucketItemProps & IBucketItemDropHandlers = {
            bucketItem: item,
            // the drop handlers only probe identity, so the item stands in for its bucket
            bucket: item as unknown as IDecoratedBucket,
            index: 0,
            bucketPosition: 0,
            itemIsAllowedToDrop: () => true,
            connectDropTarget: vi.fn(),
            onCatalogItemDropped: vi.fn(),
            onItemSwapped: vi.fn(),
        };
        const catalogItem = { type: "fact" };
        const { drop } = dropConfig;

        it("should call onCatalogItemDropped with bucketItem and dragged catalog bucketItem", () => {
            return new Promise<void>((resolve) => {
                const monitor = {
                    getItem() {
                        return { item: catalogItem };
                    },
                    getItemType() {
                        return CATALOG_LIST_ITEM;
                    },
                } as DropTargetMonitor;
                const onCatalogItemDropped: IBucketItemDropHandlers["onCatalogItemDropped"] = (
                    bucketItem,
                    droppedCatalogItem,
                ) => {
                    expect(bucketItem).toEqual(original);
                    expect(droppedCatalogItem).toEqual(catalogItem);

                    resolve();
                };

                drop({ ...defaultProps, onCatalogItemDropped }, monitor);
            });
        });

        it("should call onItemSwapped with bucketItem on drop of bucketItem", () => {
            return new Promise<void>((resolve) => {
                const bucketItem = {
                    attribute: "aaa",
                };
                const monitor = {
                    getItem() {
                        return { bucketItem };
                    },
                    getItemType() {
                        return BUCKET_ITEM;
                    },
                } as DropTargetMonitor;
                const onItemSwapped: IBucketItemDropHandlers["onItemSwapped"] = (
                    localIdentifier,
                    from,
                    to,
                ) => {
                    expect(localIdentifier).toEqual(null);
                    expect(from).toEqual(bucketItem);
                    expect(to).toEqual(original);

                    resolve();
                };

                drop({ ...defaultProps, onItemSwapped }, monitor);
            });
        });
    });

    describe("#canDrop", () => {
        const { canDrop } = dropConfig;
        const BUCKET_ITEM_CLASS = ".s-bucket-item";
        const bucketItem = newDecoratedBucketItem({
            attribute: {
                title: "title",
                type: "type",
            },
            original: {
                localIdentifier: "localIdentifier",
            },
        });

        const defaultProps: IBucketItemProps = {
            bucketItem,
            bucket: newDecoratedBucket({ localIdentifier: "localIdentifier", items: [bucketItem] }),
            itemIsAllowedToDrop: () => true,
            index: 0,
            bucketPosition: 0,
        };

        const Wrapped = withDragDrop(withIntl(withRedux(Target, setupAppStateWithDateDatasetMeta)));

        it("should have adi-replace-invitation class", () => {
            render(<Wrapped {...defaultProps} canDrop />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).toContain("adi-replace-invitation");
        });

        it("should have adi-droppable-active class", () => {
            render(<Wrapped {...defaultProps} canDrop />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).toContain("adi-droppable-active");
        });

        it("should not have adi-replace-invitation class", () => {
            render(<Wrapped {...defaultProps} />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).not.toContain("adi-replace-invitation");
        });

        it("should not have adi-droppable-active class", () => {
            render(<Wrapped {...defaultProps} />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).not.toContain("adi-droppable-active");
        });

        it("should pass in dragged item and bucket item", () => {
            const draggedItem = { item: { type: "fact" } };
            const originalBucketItem = {};
            const currentBucketItem = newDecoratedBucketItem({ original: originalBucketItem });
            const monitor = {
                getItem() {
                    return draggedItem;
                },
            } as DropTargetMonitor;

            const isAllowedToReplace = vi.fn(() => false);
            const res = canDrop(
                {
                    ...defaultProps,
                    itemIsAllowedToDrop: isAllowedToReplace,
                    bucketItem: currentBucketItem,
                },
                monitor,
            );

            expect(res).toEqual(false);
            expect(isAllowedToReplace).toHaveBeenCalledWith({
                item: draggedItem.item,
                destBucketItem: originalBucketItem,
            });
        });
    });

    describe("#isOver", () => {
        const BUCKET_ITEM_CLASS = ".s-bucket-item";
        const bucketItem = newDecoratedBucketItem({
            attribute: {
                title: "title",
                type: "type",
            },
            original: {
                localIdentifier: "localIdentifier",
            },
        });

        const defaultProps: IBucketItemProps = {
            bucketItem,
            bucket: newDecoratedBucket({ localIdentifier: "localIdentifier", items: [bucketItem] }),
            itemIsAllowedToDrop: () => true,
            itemType: CATALOG_LIST_ITEM,
            index: 0,
            bucketPosition: 0,
            connectDropTarget: ((v) => v) as ConnectDropTarget,
        };

        const Wrapped = withDragDrop(withIntl(withRedux(Target, setupAppStateWithDateDatasetMeta)));

        it("should have adi-droppable-hover class", () => {
            render(<Wrapped {...defaultProps} canDrop isOver />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).toContain("adi-droppable-hover");
        });

        it("should not have adi-droppable-hover class", () => {
            render(<Wrapped {...defaultProps} isOver />);
            const replaceable = document.querySelector(BUCKET_ITEM_CLASS);

            expect(replaceable.className).not.toContain("adi-droppable-hover");
        });
    });
});
