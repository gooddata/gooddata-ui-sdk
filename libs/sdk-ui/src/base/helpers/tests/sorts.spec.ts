// (C) 2007-2018 GoodData Corporation
import { getDefaultTreemapSortFromBuckets } from "../sorts";
import { newBucket } from "@gooddata/sdk-model";
import { SEGMENT, VIEW } from "../../constants/bucketNames";
import { Model } from "../../../index";

describe("sorts", () => {
    const measure1 = Model.measure("mid1")
        .localIdentifier("m1")
        .alias("Measure m1");
    const attribute1 = Model.attribute("aid1").localIdentifier("a1");
    const attribute2 = Model.attribute("aid2").localIdentifier("a2");
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
