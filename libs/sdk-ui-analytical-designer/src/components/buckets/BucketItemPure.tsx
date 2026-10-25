// (C) 2007-2026 GoodData Corporation

import { type ComponentType, type ReactElement, memo } from "react";

import { type ConnectDragSource } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { getOperandLocalIdentifiers, getType } from "../../models/bucket_item.js";
import { getDecoratedBucketItems } from "../../selectors/buckets_selector.js";
import {
    type IBucketSequenceNumbers,
    getMeasureSequenceNumbers,
} from "../../selectors/measure_sequence_numbers_selector.js";
import {
    getAboutToBeRemovedBucketAndFilterItems,
    getHighlightedBucketItems,
} from "../../store/highlighting/highlighting_selector.js";
import { type IAppState } from "../../store/types.js";
import { type IDecoratedBucketItem, type IDecoratedBucketItems } from "../../typings/buckets.js";
import { getCssClass } from "../../utils/css_class.js";

import { MeasureBucketItem } from "./MeasureBucketItem.js";
import { ArithmeticMeasureBucketItem } from "./measures/arithmetic_measure/ArithmeticMeasureBucketItem.js";
import { SimpleBucketItem } from "./SimpleBucketItem.js";

const getBucketItemIdClassNamePrefix = (
    bucketItem: IDecoratedBucketItem,
    bucketItems: IDecoratedBucketItems,
    measureSequenceNumbers: IBucketSequenceNumbers,
): string => {
    if (bucketItem.isArithmeticMeasure) {
        return `arithmetic_${measureSequenceNumbers[bucketItem.localIdentifier]}`;
    }

    if (bucketItem.isDerived) {
        const masterMeasure: IDecoratedBucketItem = bucketItems.find(
            (item: IDecoratedBucketItem) => item.localIdentifier === bucketItem.masterLocalIdentifier,
        );

        if (masterMeasure?.isArithmeticMeasure) {
            return `derived_arithmetic_${measureSequenceNumbers[masterMeasure.localIdentifier]}`;
        }
    }

    if (bucketItem.isDate) {
        return "date";
    }

    return bucketItem.attribute?.identifier;
};

const getBucketItemIdClassNameSuffix = (bucketItem: IDecoratedBucketItem): string =>
    getType(bucketItem) === "fact" ? "_generated" : "";

export function getBucketItemIdClassName(
    bucketItem: IDecoratedBucketItem,
    bucketItems: IDecoratedBucketItems,
    measureSequenceNumbers: IBucketSequenceNumbers,
): string {
    const prefix = getBucketItemIdClassNamePrefix(bucketItem, bucketItems, measureSequenceNumbers);
    const suffix = getBucketItemIdClassNameSuffix(bucketItem);
    return getCssClass(prefix + suffix, "s-id-").replace(/\./g, "_");
}

function getBucketItemTypeClassNames(bucketItem: IDecoratedBucketItem): string[] {
    const types = [];
    if (bucketItem.isArithmeticMeasure) {
        types.push("arithmetic");
    }
    if (bucketItem.isMeasure) {
        if (bucketItem.isDerived) {
            types.push("derived");
        } else {
            types.push("master");
        }
    }
    return types.map((type) => `s-type-${type}`);
}

const hasArithmeticMeasureNoOperands = (bucketItem: IDecoratedBucketItem): boolean => {
    if (bucketItem.isArithmeticMeasure) {
        const operandLocalIdentifiers: string[] = getOperandLocalIdentifiers(bucketItem);

        return operandLocalIdentifiers.every((operandLocalIdentifier) => operandLocalIdentifier === null);
    }

    return false;
};

interface IBucketItemPureOwnProps {
    bucketItem: IDecoratedBucketItem;
    connectDragSource?: ConnectDragSource;
    localIdentifier?: string;
    className?: string;
    isDragging?: boolean;
    dragHandle?: boolean;
    isDraggedItem?: boolean;
}

interface IBucketItemPureStateProps {
    measureSequenceNumbers: IBucketSequenceNumbers;
    bucketItems: IDecoratedBucketItems;
    highlightedLocalIdentifiers?: string[] | undefined;
    aboutToBeRemovedBucketAndFilterItems?: string[] | undefined;
}

interface IBucketItemPureProps extends IBucketItemPureOwnProps, IBucketItemPureStateProps {}

const makeMapStateToProps = () => {
    return createStructuredSelector({
        measureSequenceNumbers: getMeasureSequenceNumbers,
        bucketItems: getDecoratedBucketItems,
        highlightedLocalIdentifiers: getHighlightedBucketItems,
        aboutToBeRemovedBucketAndFilterItems: getAboutToBeRemovedBucketAndFilterItems,
    });
};

export const BucketItemPure = connect<IBucketItemPureStateProps, object, IBucketItemPureOwnProps, IAppState>(
    makeMapStateToProps,
)(
    memo(function BucketItemPure({
        bucketItem,
        connectDragSource = ((v) => v) as ConnectDragSource,
        localIdentifier = "",
        className = "",
        isDragging = false,
        dragHandle = false,
        isDraggedItem = false,
        measureSequenceNumbers,
        bucketItems,
        highlightedLocalIdentifiers,
        aboutToBeRemovedBucketAndFilterItems,
    }: IBucketItemPureProps): ReactElement {
        const getBucketItemComponent = () => {
            if (bucketItem.isArithmeticMeasure) {
                return ArithmeticMeasureBucketItem;
            } else if (bucketItem.isMeasure) {
                return MeasureBucketItem;
            }

            return SimpleBucketItem;
        };

        const getClasses = (): string => {
            const isHighlighted = highlightedLocalIdentifiers?.includes(bucketItem.localIdentifier);

            const isAboutToBeRemoved = aboutToBeRemovedBucketAndFilterItems?.includes(
                bucketItem.localIdentifier,
            );

            return classNames(
                "adi-bucket-item",
                "s-bucket-item",
                getBucketItemIdClassName(bucketItem, bucketItems, measureSequenceNumbers),
                getBucketItemTypeClassNames(bucketItem),
                className,
                {
                    "adi-bucket-item-drag-handle": dragHandle,
                    "is-dragging": isDragging,
                    highlight: isHighlighted,
                    "about-to-be-removed": isAboutToBeRemoved,
                    "has-no-operands": hasArithmeticMeasureNoOperands(bucketItem),
                },
            );
        };

        // the per-type components share this core contract; their extra props are optional at
        // runtime and are not passed from here (previously hidden behind `any`)
        const BucketItemComponent = getBucketItemComponent() as ComponentType<{
            bucketItem: IDecoratedBucketItem;
            connectDragSource: ConnectDragSource;
            localIdentifier: string;
            isDraggedItem: boolean;
        }>;

        return (
            <div className={getClasses()}>
                <BucketItemComponent
                    bucketItem={bucketItem}
                    connectDragSource={connectDragSource}
                    localIdentifier={localIdentifier}
                    isDraggedItem={isDraggedItem}
                />
            </div>
        );
    }),
);
