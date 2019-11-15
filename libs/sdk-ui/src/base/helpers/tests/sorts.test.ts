// (C) 2007-2018 GoodData Corporation
import { getDefaultTreemapSortFromBuckets } from "../sorts";
import { newBucket, newMeasure, newAttribute } from "@gooddata/sdk-model";
import { SEGMENT, VIEW } from "../../constants/bucketNames";

describe("sorts", () => {
    const measure1 = newMeasure("mid1", m => m.localId("m1").alias("Measure m1"));
    const attribute1 = newAttribute("aid1", a => a.localId("a1"));
    const attribute2 = newAttribute("aid2", a => a.localId("a2"));
    const viewBucket = newBucket(VIEW, attribute1);
    const segmentBucket = newBucket(SEGMENT, attribute2);
    const emptySegmentBucket = newBucket(SEGMENT);

    describe("getDefaultTreemapSortFromBuckets", () => {
        it("should get empty sort for only a single attribute", () => {
            const sort = getDefaultTreemapSortFromBuckets(viewBucket, emptySegmentBucket, [measure1]);
            expect(sort).toEqual([]);
        });

        it("should get attribute and measure sort if view by and stack by", () => {
            const sort = getDefaultTreemapSortFromBuckets(viewBucket, segmentBucket, [measure1]);
            expect(sort).toEqual([
                {
                    attributeSortItem: {
                        direction: "asc",
                        attributeIdentifier: "a1",
                    },
                },
                {
                    measureSortItem: {
                        direction: "desc",
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: "m1",
                                },
                            },
                        ],
                    },
                },
            ]);
        });
    });
});
