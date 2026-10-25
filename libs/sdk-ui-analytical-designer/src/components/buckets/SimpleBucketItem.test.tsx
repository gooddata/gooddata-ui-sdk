// (C) 2007-2026 GoodData Corporation

import { type ConnectDragSource } from "@evil-internetmann/react-dnd";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IDecoratedDateDatasetItem } from "../../models/date_dataset.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IAppState } from "../../store/types.js";
import { setupAppStateWithDateDatasetMeta } from "../../tests/constants.test.helpers.js";
import { withSupportedLocationIconUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import { withAppState, withData } from "../../tests/state_builder.test.helpers.js";
import { type IDecoratedGranularity } from "../../typings/buckets.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { type ISimpleBucketItemOwnProps, SimpleBucketItem } from "./SimpleBucketItem.js";

describe("SimpleBucketItem", () => {
    const defaultProps: ISimpleBucketItemOwnProps = {
        bucketItem: null,
        connectDragSource: ((v) => v) as ConnectDragSource,
        dragHandle: false,
        isLocationIconEnabled: false,
    };

    function renderComponent(
        props: Partial<ISimpleBucketItemOwnProps>,
        state = setupAppStateWithDateDatasetMeta,
    ) {
        const Wrapped = withDragDrop(withIntl(withRedux(SimpleBucketItem, state)));
        return render(<Wrapped {...defaultProps} {...props} localIdentifier="localIdentifier" />);
    }

    describe("date configuration", () => {
        it("should render the date configuration for date item", () => {
            const dateItem = newDecoratedBucketItem({
                isDate: true,
                original: {
                    localIdentifier: "localIdentifier",
                },
                dateDataset: {
                    attributes: [{ dateType: "GDC.time.year", label: "year" }],
                } as IDecoratedDateDatasetItem,
                attribute: {
                    title: "title",
                    type: "type",
                },
                granularity: {
                    dateType: "GDC.time.year",
                } as IDecoratedGranularity,
                collapsed: false,
            });
            renderComponent({ bucketItem: dateItem });

            expect(document.querySelector(".s-date-configuration")).toBeInTheDocument();
        });

        it("should be hidden for non dates", () => {
            const metricItem = newDecoratedBucketItem({
                isDate: false,
                original: {
                    localIdentifier: "localIdentifier",
                },
                attribute: {
                    title: "title",
                    type: "type",
                },
            });
            renderComponent({ bucketItem: metricItem });
            expect(document.querySelector(".s-date-configuration")).not.toBeInTheDocument();
        });
    });

    describe("computed attribute", () => {
        // a computed attribute IS an attribute in every bucket, so its row wears the attribute glyph
        // and the attribute layout - the header never sees the computed attribute type
        it("should be laid out like an attribute", () => {
            const computedAttributeItem = newDecoratedBucketItem({
                isDate: false,
                original: {
                    localIdentifier: "localIdentifier",
                    isComputedAttribute: true,
                },
                attribute: {
                    title: "title",
                    type: "computedAttribute",
                },
            });
            renderComponent({ bucketItem: computedAttributeItem });

            expect(document.querySelectorAll(".type-attribute")).toHaveLength(1);
            expect(document.querySelectorAll(".type-computedAttribute")).toHaveLength(0);
            expect(document.querySelectorAll(".configurable-attribute")).toHaveLength(1);
        });
    });

    describe("attribute configuration", () => {
        const attributeItem = newDecoratedBucketItem({
            isDate: false,
            collapsed: false,
            original: {
                localIdentifier: "localIdentifier",
            },
            attribute: {
                title: "title",
                type: "attribute",
                identifier: "id",
                dfRef: idRef("df1"),
            },
        });

        it("should render configuration for attribute item if ff is enabled", () => {
            renderComponent({ bucketItem: attributeItem }, setupAppStateWithDateDatasetMeta);
            expect(document.querySelector(".s-attribute-configuration")).toBeInTheDocument();
        });

        it("should not render configuration for attribute item if it is collapsed", () => {
            const collapsedItem = { ...attributeItem, collapsed: true };
            renderComponent({ bucketItem: collapsedItem }, setupAppStateWithDateDatasetMeta);
            expect(document.querySelector(".s-attribute-configuration")).not.toBeInTheDocument();
        });
    });

    it("should render simple bucket item header with props", () => {
        const decoratedBucketItem = newDecoratedBucketItem({
            localIdentifier: "localIdentifier",
            alias: "New Title",
            original: {
                localIdentifier: "localIdentifier",
            },
            attribute: {
                identifier: "attr.title",
                title: "title",
                type: "type",
            },
        });
        renderComponent({ bucketItem: decoratedBucketItem });

        const simpleBucketItemHeader = document.querySelector(".s-bucket-item-header");
        expect(simpleBucketItemHeader).toBeInTheDocument();
    });

    function setExtendedReferencePointLocationSupported(state: IAppState) {
        const updatedState = withData(state, {
            extendedReferencePoint: withSupportedLocationIconUiConfig(state.data.extendedReferencePoint, {
                supported: true,
            }),
        });
        return setupAppStateWithDateDatasetMeta(updatedState);
    }

    it("should render simple bucket item header that has location icon", () => {
        const decoratedBucketItem = newDecoratedBucketItem({
            original: {
                localIdentifier: "localIdentifier",
            },
            attribute: {
                title: "title",
                type: "attribute",
                displayForms: [
                    {
                        id: "geoDf",
                        uri: "geoUri",
                        title: "Geo pin",
                        ref: uriRef("geoUri"),
                        type: "GDC.geo.pin",
                    },
                ],
            },
        });
        const customProps = { bucketItem: decoratedBucketItem };
        renderComponent(customProps, setExtendedReferencePointLocationSupported);
        const simpleBucketItemHeader = document.querySelector(".s-bucket-item-header");
        const simpleBucketItemHeaderIcon = simpleBucketItemHeader.querySelector(".type-geo_attribute");

        expect(simpleBucketItemHeader).toBeInTheDocument();
        expect(simpleBucketItemHeaderIcon).toBeInTheDocument();
    });

    describe("draggable", () => {
        const decoratedBucketItem = newDecoratedBucketItem({
            original: {
                localIdentifier: "localIdentifier",
            },
            attribute: {
                title: "title",
                type: "type",
            },
        });

        function setRenamingBucketItem(state: IAppState) {
            const updatedState = withAppState(state, { renamingBucketItem: true });
            return setupAppStateWithDateDatasetMeta(updatedState);
        }

        it("should be decorated draggable when NOT renaming", () => {
            const connectDragSource = vi.fn();
            renderComponent({ bucketItem: decoratedBucketItem, connectDragSource });
            expect(connectDragSource).toBeCalled();
        });

        it("should NOT be decorated draggable when renaming", () => {
            const connectDragSource = vi.fn();
            renderComponent({ bucketItem: decoratedBucketItem, connectDragSource }, setRenamingBucketItem);
            expect(connectDragSource).not.toBeCalled();
        });
    });
});
