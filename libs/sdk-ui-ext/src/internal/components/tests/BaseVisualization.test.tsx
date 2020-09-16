// (C) 2019 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { shallow } from "enzyme";
import { testUtils } from "@gooddata/util";

import { BaseVisualization, IBaseVisualizationProps } from "../BaseVisualization";
import {
    IBucketItem,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    IDrillDownContext,
} from "../../interfaces/Visualization";

import * as testMocks from "../../tests/mocks/testMocks";
import { emptyReferencePoint } from "../../tests/mocks/referencePointMocks";

import { AbstractPluggableVisualization } from "../pluggableVisualizations/AbstractPluggableVisualization";
import { VisualizationTypes, IDrillableItem } from "@gooddata/sdk-ui";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CatalogViaTypeToClassMap, IVisualizationCatalog } from "../VisualizationCatalog";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { DummyVisConstruct } from "../pluggableVisualizations/tests/visConstruct.fixture";

const { delay } = testUtils;

class DummyClass extends AbstractPluggableVisualization {
    constructor(props: IVisConstruct) {
        super(props);
    }

    public update(opts?: IVisProps) {
        noop(opts);
        return;
    }

    protected renderConfigurationPanel(_insight: IInsightDefinition): void {
        return;
    }

    protected renderVisualization(
        _options: IVisProps,
        _insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ): void {
        return;
    }

    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        _drillDownContext: IDrillDownContext,
    ): IInsight {
        return sourceVisualization;
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<any> {
        return Promise.resolve({ referencePoint });
    }
    public unmount() {
        return;
    }
}

describe("BaseVisualization", () => {
    const defaultVisualizationsCatalog = new CatalogViaTypeToClassMap({
        table: DummyClass,
    });

    const defaultProps: IBaseVisualizationProps = {
        projectId: "PROJECTID",
        insight: testMocks.emptyInsight,
        insightPropertiesMeta: {},
        visualizationClass: testMocks.dummyTableVisualizationClass,
        backend: dummyBackend(),
        referencePoint: emptyReferencePoint,
        drillableItems: [],
        onError: noop,
        onExportReady: noop,
        onLoadingChanged: noop,
        afterRender: noop,
        pushData: noop,
        visualizationCatalog: defaultVisualizationsCatalog,
        onExtendedReferencePointChanged: noop,
        onNewDerivedBucketItemsPlaced: noop,
    };

    function createComponent(props: IBaseVisualizationProps) {
        return shallow(<BaseVisualization {...props} />, { lifecycleExperimental: true });
    }

    function getDummyComponent(customProps?: Partial<IBaseVisualizationProps>) {
        const tableConstructorCall = jest.fn();
        const tableUpdateCall = jest.fn();
        const tableAddBucketItemsCall = jest.fn();
        const onExportReady = jest.fn();

        class DummyTable extends DummyClass {
            constructor(props: IVisConstruct) {
                super(props);
                tableConstructorCall(props);
            }
            public update(opts: IVisProps) {
                tableUpdateCall(opts);
                onExportReady();
            }

            public addNewDerivedBucketItems(
                referencePoint: IReferencePoint,
                newDerivedBucketItems: IBucketItem[],
            ) {
                tableAddBucketItemsCall(newDerivedBucketItems);
                return Promise.resolve(referencePoint);
            }
        }

        const columnConstructorCall = jest.fn();
        const columnAddBucketItemsCall = jest.fn();
        class DummyColumn extends DummyClass {
            constructor() {
                super(DummyVisConstruct);
                columnConstructorCall();
            }

            public addNewDerivedBucketItems(
                referencePoint: IReferencePoint,
                newDerivedBucketItems: IBucketItem[],
            ) {
                columnAddBucketItemsCall(newDerivedBucketItems);
                return Promise.resolve(referencePoint);
            }
        }

        const visualizationCatalog = new CatalogViaTypeToClassMap({
            table: DummyTable,
            column: DummyColumn,
        });

        const component = createComponent({
            ...defaultProps,
            visualizationCatalog,
            ...customProps,
        });

        return {
            component,
            columnConstructorCall,
            columnAddBucketItemsCall,
            tableConstructorCall,
            tableUpdateCall,
            tableAddBucketItemsCall,
            onExportReady,
        };
    }

    it("should render div for all visualizations", () => {
        const wrapper = createComponent(defaultProps);

        expect(wrapper.find("div.gd-base-visualization").length).toBe(1);
    });

    describe("feature flags in visualization instance", () => {
        it("should propagate feature flags", () => {
            const { tableConstructorCall } = getDummyComponent({
                featureFlags: {
                    testFlag: true,
                },
            });

            expect(tableConstructorCall).toHaveBeenCalledTimes(1);
            expect(tableConstructorCall).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    featureFlags: {
                        testFlag: true,
                    },
                }),
            );
        });

        it("should by default propagate empty object as feature flags", () => {
            const { tableConstructorCall } = getDummyComponent();

            expect(tableConstructorCall).toHaveBeenCalledTimes(1);
            expect(tableConstructorCall).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    featureFlags: {},
                }),
            );
        });
    });

    describe("triggerAddNewDerivedBucketItems", () => {
        const newDerivedBucketItem: IBucketItem = {
            localIdentifier: "m1",
            masterLocalIdentifier: "m2",
        };
        const emptyReferencePoint: IReferencePoint = {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [],
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [],
            },
        };
        const referencePointWithMeasure: IReferencePoint = {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [newDerivedBucketItem],
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [],
            },
        };

        it("should process new derived bucket items and call onNewDerivedBucketItemsPlaced", () => {
            const onNewDerivedBucketItemsPlaced = jest.fn();
            const onExtendedReferencePointChanged = jest.fn();

            const { tableAddBucketItemsCall, component } = getDummyComponent();

            component.setProps({
                newDerivedBucketItems: [newDerivedBucketItem],
                onExtendedReferencePointChanged,
                onNewDerivedBucketItemsPlaced,
            });

            return delay().then(() => {
                expect(tableAddBucketItemsCall).toHaveBeenCalledTimes(1);
                expect(onNewDerivedBucketItemsPlaced).toHaveBeenCalledTimes(1);
                expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(0);
            });
        });

        it("should NOT call onNewDerivedBucketItemsPlaced when newDerivedBucketItems are empty", () => {
            const onNewDerivedBucketItemsPlaced = jest.fn();
            const onExtendedReferencePointChanged = jest.fn();

            const { tableAddBucketItemsCall, component } = getDummyComponent({
                referencePoint: emptyReferencePoint,
                newDerivedBucketItems: [newDerivedBucketItem],
            });

            component.setProps({
                referencePoint: referencePointWithMeasure,
                newDerivedBucketItems: [],
                onNewDerivedBucketItemsPlaced,
                onExtendedReferencePointChanged,
            });

            return delay().then(() => {
                expect(tableAddBucketItemsCall).toHaveBeenCalledTimes(0);
                expect(onNewDerivedBucketItemsPlaced).toHaveBeenCalledTimes(0);
                expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(1);
            });
        });

        it("should NOT process when newDerivedBucketItems are unchanged", () => {
            const onNewDerivedBucketItemsPlaced = jest.fn();
            const onExtendedReferencePointChanged = jest.fn();

            const { tableAddBucketItemsCall, component } = getDummyComponent({
                newDerivedBucketItems: [newDerivedBucketItem],
            });

            component.setProps({
                newDerivedBucketItems: [newDerivedBucketItem],
                onNewDerivedBucketItemsPlaced,
                onExtendedReferencePointChanged,
            });

            return delay().then(() => {
                expect(tableAddBucketItemsCall).toHaveBeenCalledTimes(0);
                expect(onNewDerivedBucketItemsPlaced).toHaveBeenCalledTimes(0);
                expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(0);
            });
        });
    });

    it("should call update on visualization", () => {
        const { tableUpdateCall } = getDummyComponent();

        expect(tableUpdateCall).toHaveBeenCalledTimes(1);
        expect(tableUpdateCall).toHaveBeenCalledWith({
            custom: {
                totalsEditAllowed: undefined,
                drillableItems: [],
            },
            dimensions: {
                height: undefined,
            },
            locale: undefined,
        });
    });

    it("should call update on visualization and include custom props if supported", () => {
        const { component, tableUpdateCall } = getDummyComponent();

        const totalsEditAllowed = true;
        const drillableItems: IDrillableItem[] = [];

        component.setProps({
            type: VisualizationTypes.TABLE,
            totalsEditAllowed,
            drillableItems,
        });

        return delay().then(() => {
            expect(tableUpdateCall).toHaveBeenCalledWith({
                custom: {
                    drillableItems,
                    legendConfig: undefined,
                    totalsEditAllowed,
                },
                dimensions: { height: undefined },
                locale: undefined,
            });
        });
    });

    it("should setup new visualization when type changes and get new reference point", () => {
        const { component, columnConstructorCall } = getDummyComponent();
        const onColumnBucketsChange = jest.fn();

        component.setProps({
            visualizationClass: testMocks.dummyColumnVisualizationClass,
            onExtendedReferencePointChanged: onColumnBucketsChange,
            referencePoint: {},
        });

        return delay().then(() => {
            expect(onColumnBucketsChange).toHaveBeenCalledTimes(1);
            expect(columnConstructorCall).toHaveBeenCalledTimes(1);
        });
    });

    // tslint:disable-next-line:max-line-length
    it("should call onExtendedReferencePointChanged", () => {
        const { component, tableConstructorCall } = getDummyComponent();
        const onExtendedReferencePointChanged = jest.fn();

        component.setProps({
            onExtendedReferencePointChanged,
            referencePoint: {},
        });

        return delay().then(() => {
            expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(1);
            expect(onExtendedReferencePointChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    referencePoint: {},
                }),
            );
            expect(tableConstructorCall).toHaveBeenCalledTimes(1);
        });
    });

    it("should not setup visualization of unknown type", () => {
        // backup console object, restore at the end
        const originalConsoleError = global.console.error;
        global.console.error = jest.fn();

        createComponent({
            ...defaultProps,
            visualizationClass: testMocks.dummyUnknownTypeVisualizationClass,
        });

        expect(console.error).toBeCalled(); // eslint-disable-line no-console
        global.console.error = originalConsoleError;
    });

    describe("getExtendedReferencePoint in componentDidMount", () => {
        let visualizationCatalog: IVisualizationCatalog;
        let getExtendedReferencePointMock = jest.fn();
        let originalConsoleError: any;

        beforeAll(() => {
            originalConsoleError = global.console.error;
            global.console.error = noop;
        });

        afterAll(() => {
            global.console.error = originalConsoleError;
        });

        beforeEach(() => {
            getExtendedReferencePointMock = jest.fn();
            class DummyTable extends DummyClass {
                public getExtendedReferencePoint() {
                    getExtendedReferencePointMock();
                    return Promise.resolve({});
                }
            }

            visualizationCatalog = new CatalogViaTypeToClassMap({ table: DummyTable });
        });

        afterEach(() => {
            getExtendedReferencePointMock = null;
            visualizationCatalog = defaultVisualizationsCatalog;
        });

        it("should not call getExtendedReferencePoint if vis type is unknown", () => {
            createComponent({
                ...defaultProps,
                visualizationClass: testMocks.dummyUnknownTypeVisualizationClass,
                visualizationCatalog,
            });

            return delay().then(() => {
                expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
            });
        });

        it("should not call getExtendedReferencePoint if referencePoint is not provided", () => {
            createComponent({
                ...defaultProps,
                referencePoint: null,
                visualizationCatalog,
            });

            return delay().then(() => {
                expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
            });
        });

        it("should not call getExtendedReferencePoint if no callback is provided", () => {
            createComponent({
                ...defaultProps,
                visualizationCatalog,
                onExtendedReferencePointChanged: null,
            });

            return delay().then(() => {
                expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
            });
        });
    });

    it("should call onExportReady", async () => {
        const { onExportReady } = getDummyComponent();
        await delay();
        expect(onExportReady).toHaveBeenCalledTimes(1);
    });
});
