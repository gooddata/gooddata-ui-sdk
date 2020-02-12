// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisualization,
    IBucketItem,
    IVisProps,
    IBucketOfFun,
} from "../../interfaces/Visualization";
import { findDerivedBucketItem, hasDerivedBucketItems, isDerivedBucketItem } from "../../utils/bucketHelper";
import { IInsight } from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";

export abstract class AbstractPluggableVisualization implements IVisualization {
    protected supportedPropertiesList: string[];

    public addNewDerivedBucketItems(
        referencePoint: IReferencePoint,
        newDerivedBucketItems: IBucketItem[],
    ): Promise<IReferencePoint> {
        if (!referencePoint.buckets) {
            return Promise.resolve(referencePoint);
        }

        const newReferencePoint = cloneDeep<IReferencePoint>(referencePoint);
        newReferencePoint.buckets = referencePoint.buckets.map(bucket => {
            return {
                ...bucket,
                items: this.mergeDerivedBucketItems(referencePoint, bucket, newDerivedBucketItems),
            };
        });

        return Promise.resolve(newReferencePoint);
    }

    public abstract unmount(): void;

    public abstract getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint>;

    public abstract update(props: IVisProps, insight: IInsight, executionFactory: IExecutionFactory): void;

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        return bucket.items.reduce((resultItems: IBucketItem[], bucketItem: IBucketItem) => {
            const newDerivedBucketItem = findDerivedBucketItem(bucketItem, newDerivedBucketItems);
            const shouldAddItem =
                newDerivedBucketItem &&
                !isDerivedBucketItem(bucketItem) &&
                !hasDerivedBucketItems(bucketItem, referencePoint.buckets);
            if (shouldAddItem) {
                resultItems.push(newDerivedBucketItem);
            }

            resultItems.push(bucketItem);
            return resultItems;
        }, []);
    }
}
