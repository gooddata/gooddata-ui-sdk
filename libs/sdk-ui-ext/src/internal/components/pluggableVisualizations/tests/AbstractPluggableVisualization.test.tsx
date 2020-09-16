// (C) 2019 GoodData Corporation
import { IVisProps, IDrillDownContext } from "../../../interfaces/Visualization";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { BucketNames } from "@gooddata/sdk-ui";
import * as referencePointMocks from "../../../tests/mocks/referencePointMocks";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { DummyVisConstruct } from "./visConstruct.fixture";

describe("AbstractPluggableVisualization", () => {
    class DummyPluggableVisualization extends AbstractPluggableVisualization {
        constructor() {
            super(DummyVisConstruct);
        }

        public getExtendedReferencePoint(): Promise<any> {
            return Promise.resolve({});
        }

        public unmount() {
            return;
        }

        protected renderConfigurationPanel(_insight: IInsightDefinition): void {
            return;
        }

        public getInsightWithDrillDownApplied(
            sourceVisualization: IInsight,
            _drillDownContext: IDrillDownContext,
        ): IInsight {
            return sourceVisualization;
        }

        protected renderVisualization(
            _options: IVisProps,
            _insight: IInsightDefinition,
            _executionFactory: IExecutionFactory,
        ): void {
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
