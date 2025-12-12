// (C) 2019-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IExecutionFactory, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IInsightDefinition } from "@gooddata/sdk-model";
import { type IDrillableItem } from "@gooddata/sdk-ui";
import { suppressConsole } from "@gooddata/util";

import {
    type IBucketItem,
    type IDrillDownContext,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
} from "../../interfaces/Visualization.js";
import {
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor.js";
import { emptyReferencePoint, justViewByReferencePoint } from "../../tests/mocks/referencePointMocks.js";
import * as testMocks from "../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../utils/translations.js";
import { BaseVisualization, type IBaseVisualizationProps } from "../BaseVisualization.js";
import { AbstractPluggableVisualization } from "../pluggableVisualizations/AbstractPluggableVisualization.js";
import { BaseChartDescriptor } from "../pluggableVisualizations/baseChart/BaseChartDescriptor.js";
import { DummyVisConstruct } from "../pluggableVisualizations/tests/visConstruct.fixture.js";
import { CatalogViaTypeToClassMap, type IVisualizationCatalog } from "../VisualizationCatalog.js";

const pluggableVisualizationGetExecutionMock = vi.fn(() => ({}) as IPreparedExecution);

class DummyClass extends AbstractPluggableVisualization {
    constructor(props: IVisConstruct) {
        super(props);
    }

    public override update(_opts?: IVisProps) {}

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

    public override getInsightWithDrillDownApplied(
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

    public getExecution(
        _options: IVisProps,
        _insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ) {
        return pluggableVisualizationGetExecutionMock();
    }
}

class DummyClassDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new DummyClass(params);
    }
    public getMeta(): IVisualizationMeta {
        return { supportsExport: true, supportsZooming: true };
    }
}

describe("BaseVisualization", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const defaultVisualizationsCatalog = new CatalogViaTypeToClassMap({
        table: DummyClassDescriptor,
        // include tablenext so tests work when enableNewPivotTable is on
        tablenext: DummyClassDescriptor,
    });

    const defaultProps: IBaseVisualizationProps = {
        projectId: "PROJECTID",
        insight: testMocks.emptyInsight,
        insightPropertiesMeta: {},
        visualizationClass: testMocks.dummyTableVisualizationClass,
        backend: dummyBackend(),
        referencePoint: emptyReferencePoint,
        drillableItems: [],
        onError: () => {},
        onExportReady: () => {},
        messages,
        onLoadingChanged: () => {},
        afterRender: () => {},
        pushData: () => {},
        visualizationCatalog: defaultVisualizationsCatalog,
        onExtendedReferencePointChanged: () => {},
        onNewDerivedBucketItemsPlaced: () => {},
    };

    function createComponent(props: IBaseVisualizationProps) {
        return render(<BaseVisualization {...props} />);
    }

    function getDummyComponent(customProps?: Partial<IBaseVisualizationProps>) {
        const tableConstructorCall = vi.fn();
        const tableUpdateCall = vi.fn();
        const tableAddBucketItemsCall = vi.fn();
        const onExportReady = vi.fn();

        class DummyTable extends DummyClass {
            constructor(props: IVisConstruct) {
                super(props);
                tableConstructorCall(props);
            }
            public override update(opts: IVisProps) {
                tableUpdateCall(opts);
                onExportReady();
            }

            public override addNewDerivedBucketItems(
                referencePoint: IReferencePoint,
                newDerivedBucketItems: IBucketItem[],
            ) {
                tableAddBucketItemsCall(newDerivedBucketItems);
                return Promise.resolve(referencePoint);
            }
        }

        class DummyTableDescriptor extends DummyClassDescriptor {
            public override getFactory(): PluggableVisualizationFactory {
                return (params) => new DummyTable(params);
            }
            public override getMeta(): IVisualizationMeta {
                return { supportsExport: true, supportsZooming: true };
            }
        }

        const columnConstructorCall = vi.fn();
        const columnAddBucketItemsCall = vi.fn();
        class DummyColumn extends DummyClass {
            constructor() {
                super(DummyVisConstruct as unknown as IVisConstruct);
                columnConstructorCall();
            }

            public override addNewDerivedBucketItems(
                referencePoint: IReferencePoint,
                newDerivedBucketItems: IBucketItem[],
            ) {
                columnAddBucketItemsCall(newDerivedBucketItems);
                return Promise.resolve(referencePoint);
            }
        }

        class DummyColumnDescriptor extends DummyClassDescriptor {
            public override getFactory(): PluggableVisualizationFactory {
                return () => new DummyColumn();
            }
            public override getMeta(): IVisualizationMeta {
                return { supportsExport: true, supportsZooming: true };
            }
        }

        const visualizationCatalog = new CatalogViaTypeToClassMap({
            table: DummyTableDescriptor,
            tablenext: DummyTableDescriptor,
            column: DummyColumnDescriptor,
        });

        const component = createComponent({
            ...defaultProps,
            visualizationCatalog,
            ...customProps,
        });

        return {
            component,
            visualizationCatalog,
            columnConstructorCall,
            columnAddBucketItemsCall,
            tableConstructorCall,
            tableUpdateCall,
            tableAddBucketItemsCall,
            onExportReady,
        };
    }

    it("should render div for all visualizations", () => {
        createComponent(defaultProps);

        expect(screen.getByLabelText("base-visualization")).toBeInTheDocument();
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

        it("should process new derived bucket items and call onNewDerivedBucketItemsPlaced", async () => {
            const onNewDerivedBucketItemsPlaced = vi.fn();
            const onExtendedReferencePointChanged = vi.fn();

            const {
                tableAddBucketItemsCall,
                component: { rerender },
            } = getDummyComponent();

            rerender(
                <BaseVisualization
                    {...defaultProps}
                    newDerivedBucketItems={[newDerivedBucketItem]}
                    onExtendedReferencePointChanged={onExtendedReferencePointChanged}
                    onNewDerivedBucketItemsPlaced={onNewDerivedBucketItemsPlaced}
                />,
            );

            await waitFor(() => {
                expect(tableAddBucketItemsCall).toHaveBeenCalledTimes(1);
                expect(onNewDerivedBucketItemsPlaced).toHaveBeenCalledTimes(1);
                expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(0);
            });
        });

        it("should NOT call onNewDerivedBucketItemsPlaced when newDerivedBucketItems are empty", async () => {
            const onNewDerivedBucketItemsPlaced = vi.fn();
            const onExtendedReferencePointChanged = vi.fn();

            const {
                tableAddBucketItemsCall,
                component: { rerender },
            } = getDummyComponent({
                referencePoint: emptyReferencePoint,
                newDerivedBucketItems: [newDerivedBucketItem],
            });

            rerender(
                <BaseVisualization
                    {...defaultProps}
                    referencePoint={referencePointWithMeasure}
                    newDerivedBucketItems={[]}
                    onExtendedReferencePointChanged={onExtendedReferencePointChanged}
                    onNewDerivedBucketItemsPlaced={onNewDerivedBucketItemsPlaced}
                />,
            );

            await waitFor(() => {
                expect(tableAddBucketItemsCall).toHaveBeenCalledTimes(0);
                expect(onNewDerivedBucketItemsPlaced).toHaveBeenCalledTimes(0);
                expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(1);
            });
        });

        it("should NOT process when newDerivedBucketItems are unchanged", async () => {
            const onNewDerivedBucketItemsPlaced = vi.fn();
            const onExtendedReferencePointChanged = vi.fn();

            const {
                tableAddBucketItemsCall,
                component: { rerender },
            } = getDummyComponent({
                newDerivedBucketItems: [newDerivedBucketItem],
            });

            rerender(
                <BaseVisualization
                    {...defaultProps}
                    newDerivedBucketItems={[newDerivedBucketItem]}
                    onExtendedReferencePointChanged={onExtendedReferencePointChanged}
                    onNewDerivedBucketItemsPlaced={onNewDerivedBucketItemsPlaced}
                />,
            );

            await waitFor(() => {
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
            messages,
        });
    });

    it("should call update on visualization and include custom props if supported", async () => {
        const {
            component: { rerender },
            tableUpdateCall,
            visualizationCatalog,
        } = getDummyComponent();

        const totalsEditAllowed = true;
        const drillableItems: IDrillableItem[] = [];

        rerender(
            <BaseVisualization
                {...defaultProps}
                {...visualizationCatalog}
                totalsEditAllowed={totalsEditAllowed}
                drillableItems={drillableItems}
            />,
        );

        await waitFor(() => {
            expect(tableUpdateCall).toHaveBeenCalledWith({
                custom: {
                    drillableItems,
                    legendConfig: undefined,
                    totalsEditAllowed,
                },
                dimensions: { height: undefined },
                locale: undefined,
                messages,
            });
        });
    });

    it("should setup new visualization when type changes and get new reference point", async () => {
        const {
            component: { rerender },
            columnConstructorCall,
        } = getDummyComponent();
        const onColumnBucketsChange = vi.fn();

        rerender(
            <BaseVisualization
                {...defaultProps}
                visualizationClass={testMocks.dummyColumnVisualizationClass}
                onExtendedReferencePointChanged={onColumnBucketsChange}
            />,
        );

        await waitFor(() => {
            expect(onColumnBucketsChange).toHaveBeenCalledTimes(1);
            expect(columnConstructorCall).toHaveBeenCalledTimes(1);
        });
    });

    it("should call onExtendedReferencePointChanged", async () => {
        const {
            component: { rerender },
            tableConstructorCall,
        } = getDummyComponent();
        const onExtendedReferencePointChanged = vi.fn();

        rerender(
            <BaseVisualization
                {...defaultProps}
                onExtendedReferencePointChanged={onExtendedReferencePointChanged}
                referencePoint={justViewByReferencePoint}
            />,
        );

        await waitFor(() => {
            expect(onExtendedReferencePointChanged).toHaveBeenCalledTimes(1);
            expect(onExtendedReferencePointChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    referencePoint: justViewByReferencePoint,
                }),
                expect.objectContaining({
                    availableSorts: [],
                    defaultSort: [],
                    disabled: false,
                    supported: false,
                }),
            );
            expect(tableConstructorCall).toHaveBeenCalledTimes(1);
        });
    });

    it("should render message in case visualization type is unknown", () => {
        const onLoadingChanged = vi.fn();
        suppressConsole(
            () =>
                createComponent({
                    ...defaultProps,
                    insight: testMocks.dummyInsight,
                    visualizationClass: testMocks.dummyUnknownTypeVisualizationClass,
                    onLoadingChanged,
                }),
            ["error", "warn"],
            [{ type: "startsWith", value: "Unknown visualization class: unknown" }],
        );

        expect(onLoadingChanged).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Sorry, we can't display this visualization")).toBeInTheDocument();
    });

    describe("getExtendedReferencePoint in componentDidMount", () => {
        let visualizationCatalog: IVisualizationCatalog;
        let getExtendedReferencePointMock = vi.fn();

        beforeEach(() => {
            getExtendedReferencePointMock = vi.fn();
            class DummyTable extends DummyClass {
                public override getExtendedReferencePoint() {
                    getExtendedReferencePointMock();
                    return Promise.resolve({});
                }
            }

            visualizationCatalog = new CatalogViaTypeToClassMap({ table: DummyTable, tablenext: DummyTable });
        });

        afterEach(() => {
            getExtendedReferencePointMock = null;
            visualizationCatalog = defaultVisualizationsCatalog;
        });

        it("should not call getExtendedReferencePoint if vis type is unknown", async () => {
            await suppressConsole(
                async () => {
                    createComponent({
                        ...defaultProps,
                        visualizationClass: testMocks.dummyUnknownTypeVisualizationClass,
                        visualizationCatalog,
                    });

                    await waitFor(() => {
                        expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
                    });
                },
                "warn",
                [{ type: "startsWith", value: "Unknown visualization class: unknown" }],
            );
        });

        it("should not call getExtendedReferencePoint if referencePoint is not provided", async () => {
            await suppressConsole(
                async () => {
                    createComponent({
                        ...defaultProps,
                        referencePoint: null,
                        visualizationCatalog,
                    });

                    await waitFor(() => {
                        expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
                    });
                },
                "error",
                [{ type: "exact", value: "Error: unsupported visualization type - local:table" }],
            );
        });

        it("should not call getExtendedReferencePoint if no callback is provided", async () => {
            await suppressConsole(
                async () => {
                    createComponent({
                        ...defaultProps,
                        visualizationCatalog,
                        onExtendedReferencePointChanged: null,
                    });

                    await waitFor(() => {
                        expect(getExtendedReferencePointMock).toHaveBeenCalledTimes(0);
                    });
                },
                "error",
                [{ type: "exact", value: "Error: unsupported visualization type - local:table" }],
            );
        });
    });

    it("should call onExportReady", async () => {
        const { onExportReady } = getDummyComponent();
        expect(onExportReady).toHaveBeenCalledTimes(1);
    });

    it("should call pluggable visualization's getExecution method", () => {
        const visualization = new BaseVisualization(defaultProps);

        expect(pluggableVisualizationGetExecutionMock).toHaveBeenCalledTimes(0);
        visualization.getExecution();
        expect(pluggableVisualizationGetExecutionMock).toHaveBeenCalledTimes(1);
    });
});
