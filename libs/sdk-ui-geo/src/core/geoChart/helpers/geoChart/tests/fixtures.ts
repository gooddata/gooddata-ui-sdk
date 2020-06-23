// (C) 2020 GoodData Corporation
import { newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { ExamplesLdm, ExamplesLdmExt } from "@gooddata/live-examples-workspace";

export const LocationBucket = newBucket(BucketNames.LOCATION, ExamplesLdm.City.Location);
export const SegmentBucket = newBucket(BucketNames.SEGMENT, ExamplesLdm.StateName);
export const TooltipBucket = newBucket(BucketNames.TOOLTIP_TEXT, ExamplesLdm.City.Default);
export const SizeBucket = newBucket(BucketNames.SIZE, ExamplesLdmExt.sizeMeasure);
export const ColorBucket = newBucket(BucketNames.COLOR, ExamplesLdmExt.colorMeasure);
