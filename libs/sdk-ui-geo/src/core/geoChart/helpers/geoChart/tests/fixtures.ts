// (C) 2020-2021 GoodData Corporation
import { newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { ExamplesMd, ExamplesMdExt } from "@gooddata/live-examples-workspace";

export const LocationBucket = newBucket(BucketNames.LOCATION, ExamplesMd.City.Location);
export const SegmentBucket = newBucket(BucketNames.SEGMENT, ExamplesMd.StateName);
export const TooltipBucket = newBucket(BucketNames.TOOLTIP_TEXT, ExamplesMd.City.Default);
export const SizeBucket = newBucket(BucketNames.SIZE, ExamplesMdExt.sizeMeasure);
export const ColorBucket = newBucket(BucketNames.COLOR, ExamplesMdExt.colorMeasure);
