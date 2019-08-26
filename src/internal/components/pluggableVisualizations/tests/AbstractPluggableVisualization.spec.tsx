// (C) 2019 GoodData Corporation
import { IVisProps } from "../../../interfaces/Visualization";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import * as BucketNames from "../../../../constants/bucketNames";
import * as referencePointMocks from "../../../mocks/referencePointMocks";

describe("AbstractPluggableVisualization", () => {
    class DummyPluggableVisualization extends AbstractPluggableVisualization {
        public update(_opts?: IVisProps) {
            return;
        }

        public getExtendedReferencePoint(): Promise<any> {
            return Promise.resolve({});
        }

        public unmount() {
            return;
        }
    }

    function createComponent() {
        return new DummyPluggableVisualization();
    }

    it("should add new DerivedBucketItems before each related masterBucketItem in referencePoint", async () => {
        const component = createComponent();

        const referencePointWithDerivedItems = await component.addNewDerivedBucketItems(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
            [referencePointMocks.derivedMeasureItems[0], referencePointMocks.derivedMeasureItems[1]],
        );

        expect(referencePointWithDerivedItems).toEqual({
            ...referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
            ...{
                buckets: [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [
                            referencePointMocks.derivedMeasureItems[0],
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.derivedMeasureItems[1],
                            referencePointMocks.masterMeasureItems[1],
                            referencePointMocks.masterMeasureItems[2],
                            referencePointMocks.masterMeasureItems[3],
                        ],
                    },
                    referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[1],
                    referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[2],
                ],
            },
        });
    });
});
