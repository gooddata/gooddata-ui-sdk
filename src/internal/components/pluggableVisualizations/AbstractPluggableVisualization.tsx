// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import { VisualizationObject } from "@gooddata/typings";
import IVisualizationObjectContent = VisualizationObject.IVisualizationObjectContent;
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisualization,
    IBucketItem,
    IVisProps,
    IVisualizationProperties,
    IBucket,
    IReferences,
} from "../../interfaces/Visualization";
import { findDerivedBucketItem, hasDerivedBucketItems, isDerivedBucketItem } from "../../utils/bucketHelper";

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

    public abstract update(
        props: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: IVisualizationObjectContent,
        references: IReferences,
    ): void;

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucket,
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
