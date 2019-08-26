// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import cloneDeep = require("lodash/cloneDeep");
import noop = require("lodash/noop");
import { testUtils } from "@gooddata/js-utils";
import { SDK, ApiResponseError } from "@gooddata/gooddata-js";
import { Table, BaseChart, LoadingComponent, ErrorComponent } from "../../tests/mocks";
import { visualizationObjects, visualizationClasses } from "../../../../__mocks__/fixtures";

import { AFM, VisualizationObject, VisualizationClass } from "@gooddata/typings";
import { Visualization, IntlVisualization, VisualizationWrapped } from "../Visualization";
import { ErrorStates } from "../../../constants/errorStates";
import { SortableTable } from "../../core/SortableTable";
import { PivotTable } from "../../core/PivotTable";
import { IntlWrapper } from "../../core/base/IntlWrapper";
import { VisualizationTypes } from "../../../constants/visualizationTypes";
import { RuntimeError } from "../../../errors/RuntimeError";
import { createIntlMock } from "../../visualizations/utils/intlUtils";
import * as HttpStatusCodes from "http-status-codes";
import { IColorPalette } from "../../../interfaces/Config";
import { clearSdkCache } from "../../../helpers/sdkCache";

const projectId = "myproject";
const CHART_URI = `/gdc/md/${projectId}/obj/1`;
const TABLE_URI = `/gdc/md/${projectId}/obj/2`;
const TREEMAP_URI = `/gdc/md/${projectId}/obj/3`;
const CHART_IDENTIFIER = "chart";
const TABLE_IDENTIFIER = "table";

const SLOW = 20;
const FAST = 5;

const sdk = {
    clone: () => sdk,
    md: {},
    execution: {
        getPartialExecutionResult: () => false,
        executeAfm: () => Promise.resolve(),
        getExecutionResponse: () => Promise.resolve(),
    },
    config: {
        setJsPackage: () => false,
        setRequestHeader: () => false,
    },
    project: {
        getColorPaletteWithGuids: jest.fn(() => Promise.resolve()),
        getFeatureFlags: jest.fn(() => Promise.resolve({})),
    },
};

function getResponse(response: string, delay: number): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => resolve(response), delay);
    });
}

function fetchVisObject(_sdk: SDK, uri: string): Promise<VisualizationObject.IVisualizationObject> {
    const visObj = visualizationObjects.find(chart => chart.visualizationObject.meta.uri === uri);
    if (!visObj) {
        throw new ApiResponseError(
            `Unknown uri ${uri}`,
            {
                status: HttpStatusCodes.NOT_FOUND,
            },
            {},
        );
    }

    return Promise.resolve(visObj.visualizationObject);
}

function fetchVisualizationClass(
    _sdk: SDK,
    visualizationClassUri: string,
): Promise<VisualizationClass.IVisualizationClass> {
    const visClass = visualizationClasses.find(
        vc => vc.visualizationClass.meta.uri === visualizationClassUri,
    );

    if (!visClass) {
        throw new Error(`Unknown uri ${visualizationClassUri}`);
    }

    return Promise.resolve(visClass.visualizationClass);
}

function uriResolver(_sdk: SDK, _projectId: string, uri: string, identifier: string): Promise<string> {
    if (identifier === TABLE_IDENTIFIER || uri === TABLE_URI) {
        return getResponse(TABLE_URI, FAST);
    }

    if (identifier === CHART_IDENTIFIER || uri === CHART_URI) {
        return getResponse(CHART_URI, SLOW);
    }

    if (uri === TREEMAP_URI) {
        return getResponse(TREEMAP_URI, FAST);
    }

    return Promise.reject("Unknown identifier");
}

describe("Visualization", () => {
    it("should construct and provide intl", () => {
        const props = {
            sdk,
            projectId,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            BaseChartComponent: BaseChart,
            identifier: CHART_IDENTIFIER,
        };

        const wrapper = mount(<Visualization {...props as any} />);

        return testUtils.delay(FAST + 1).then(() => {
            expect(wrapper.find(IntlWrapper).length).toBe(1);
            expect(wrapper.find(IntlVisualization).length).toBe(1);
        });
    });
});

describe("VisualizationWrapped", () => {
    afterEach(() => {
        clearSdkCache();
    });

    const intl = createIntlMock();

    it("should render chart", () => {
        const props = {
            sdk,
            projectId,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            BaseChartComponent: BaseChart,
            identifier: CHART_IDENTIFIER,
        };

        const wrapper = mount(<Visualization {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it("should render SortableTable", () => {
        const props = {
            sdk,
            projectId,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            identifier: TABLE_IDENTIFIER,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["a1"],
                    totals: [
                        {
                            attributeIdentifier: "a1",
                            measureIdentifier: "m1",
                            type: "avg",
                        },
                    ],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
            sorts: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: "asc",
                    },
                },
            ],
        };

        const expectedTotals: VisualizationObject.IVisualizationTotal[] = [
            {
                type: "avg",
                alias: "average",
                measureIdentifier: "m1",
                attributeIdentifier: "a1",
            },
        ];

        return testUtils.delay(SLOW).then(() => {
            wrapper.update();
            expect(wrapper.find(SortableTable).length).toBe(1);
            expect(wrapper.state("type")).toEqual(VisualizationTypes.TABLE);
            expect(wrapper.state("dataSource")).not.toBeNull();
            expect(wrapper.state("resultSpec")).toEqual(expectedResultSpec);
            expect(wrapper.state("totals")).toEqual(expectedTotals);
        });
    });

    it("should render PivotTable if FF enablePivot is set", () => {
        const sdkWithEnablePivot = {
            ...sdk,
            clone: () => sdkWithEnablePivot,
            project: {
                ...sdk.project,
                getFeatureFlags: jest.fn(() => Promise.resolve({ enablePivot: true })),
            },
        };

        const props = {
            sdk: sdkWithEnablePivot,
            projectId,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            identifier: TABLE_IDENTIFIER,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["a1"],
                    totals: [
                        {
                            attributeIdentifier: "a1",
                            measureIdentifier: "m1",
                            type: "avg",
                        },
                    ],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
            sorts: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: "asc",
                    },
                },
            ],
        };

        const expectedTotals: VisualizationObject.IVisualizationTotal[] = [
            {
                type: "avg",
                alias: "average",
                measureIdentifier: "m1",
                attributeIdentifier: "a1",
            },
        ];

        return testUtils.delay(SLOW).then(() => {
            wrapper.update();
            expect(wrapper.find(PivotTable).length).toBe(1);
            expect(wrapper.find(PivotTable).prop("sdk")).toEqual(sdkWithEnablePivot);
            expect(wrapper.state("type")).toEqual(VisualizationTypes.PIVOT_TABLE);
            expect(wrapper.state("dataSource")).not.toBeNull();
            expect(wrapper.state("resultSpec")).toEqual(expectedResultSpec);
            expect(wrapper.state("totals")).toEqual(expectedTotals);
        });
    });

    it("should render with uri", () => {
        const props = {
            sdk,
            projectId,
            uri: CHART_URI,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            BaseChartComponent: BaseChart,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it("should render with uri and experimental execution", () => {
        const props = {
            sdk,
            projectId,
            uri: CHART_URI,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            BaseChartComponent: BaseChart,
            experimentalVisExecution: true,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it("should trigger error in case of given uri is not valid", done => {
        const errorHandler = (error: RuntimeError) => {
            expect(error.getMessage()).toEqual(ErrorStates.NOT_FOUND);
            done();
        };

        const props = {
            sdk,
            projectId,
            uri: "/invalid/url",
            fetchVisObject,
            onError: errorHandler,
            intl,
        };

        mount(<VisualizationWrapped {...props as any} />);
    });

    it("should handle slow requests", () => {
        // Response from first request comes back later that from the second one
        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        wrapper.setProps({ identifier: TABLE_IDENTIFIER });

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(Table).length).toBe(1);
        });
    });

    it("should handle set state on unmounted component", () => {
        const mutatedSdk = {
            ...sdk,
            clone: () => mutatedSdk,
            project: {
                ...sdk.project,
                getColorPaletteWithGuids: jest.fn(),
            },
        };

        const props = {
            sdk,
            projectId,
            identifier: TABLE_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        const spy = jest.spyOn(wrapper.instance(), "setState");
        wrapper.setProps({ sdk: mutatedSdk });
        // Would throw an error if not handled properly
        wrapper.unmount();
        return testUtils.delay(FAST + 1).then(() => {
            wrapper.update();
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    it("should pass LoadingComponent and ErrorComponent to TableComponent", () => {
        const props = {
            sdk,
            projectId,
            identifier: TABLE_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(Table).length).toBe(1);
            const TableElement = wrapper.find(Table).get(0);
            expect(TableElement.props.LoadingComponent).toBe(LoadingComponent);
            expect(TableElement.props.ErrorComponent).toBe(ErrorComponent);
        });
    });

    it("should pass LoadingComponent and ErrorComponent to BaseChart", () => {
        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.LoadingComponent).toBe(LoadingComponent);
            expect(BaseChartElement.props.ErrorComponent).toBe(ErrorComponent);
        });
    });

    it("should pass exportTitle, projectId and onExportReady to BaseChart", () => {
        const exportTitle = visualizationObjects.find(
            chart => chart.visualizationObject.meta.uri === CHART_URI,
        ).visualizationObject.meta.title;
        const onExportReady = noop;
        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            onExportReady,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.exportTitle).toEqual(exportTitle);
            expect(BaseChartElement.props.projectId).toBe(projectId);
            expect(BaseChartElement.props.onExportReady).toBe(onExportReady);
        });
    });

    it("should pass mdObject and properties to BaseChart", () => {
        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        const mdObjectContent = visualizationObjects.find(
            chart => chart.visualizationObject.meta.uri === CHART_URI,
        ).visualizationObject.content;
        const mdObjectProperties = JSON.parse(mdObjectContent.properties).controls;

        const expectedMdObject = {
            mdObject: mdObjectContent,
            ...mdObjectProperties,
            colorPalette: null,
        };

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.config).toEqual(expectedMdObject);
        });
    });

    it("should override properties from mdObject by property config", () => {
        const customConfig = {
            grid: {
                enabled: false,
            },
        };

        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            TableComponent: Table,
            config: customConfig,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        const mdObjectContent = visualizationObjects.find(
            chart => chart.visualizationObject.meta.uri === CHART_URI,
        ).visualizationObject.content;

        const expectedMdObject = {
            mdObject: mdObjectContent,
            ...customConfig,
            colorPalette: null as any,
        };

        return testUtils.delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.config).toEqual(expectedMdObject);
        });
    });

    describe("Color palette", () => {
        const expectedColorPalette: IColorPalette = [
            {
                guid: "0",
                fill: {
                    r: 195,
                    g: 49,
                    b: 73,
                },
            },
            {
                guid: "1",
                fill: {
                    r: 168,
                    g: 194,
                    b: 86,
                },
            },
        ];

        it("should render BaseChart with colors prop", () => {
            const props = {
                sdk,
                projectId,
                identifier: CHART_IDENTIFIER,
                BaseChartComponent: BaseChart,
                TableComponent: Table,
                config: {
                    colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
                },
                LoadingComponent,
                ErrorComponent,
                fetchVisObject,
                fetchVisualizationClass,
                uriResolver,
                intl,
            };

            const wrapper = mount(<VisualizationWrapped {...props as any} />);

            return testUtils.delay(SLOW + 1).then(() => {
                wrapper.update();
                const BaseChartElement = wrapper.find(BaseChart).get(0);
                expect(BaseChartElement.props.config.colorPalette).toEqual(expectedColorPalette);
            });
        });

        it("should render BaseChart with color palette prop", () => {
            const mutatedSdk = {
                ...sdk,
                clone: () => mutatedSdk,
                project: {
                    ...sdk.project,
                    getColorPaletteWithGuids: jest.fn().mockImplementation(() => expectedColorPalette),
                },
            };

            const props = {
                sdk: mutatedSdk,
                projectId,
                identifier: CHART_IDENTIFIER,
                BaseChartComponent: BaseChart,
                TableComponent: Table,
                config: {
                    colorPalette: expectedColorPalette,
                },
                LoadingComponent,
                ErrorComponent,
                fetchVisObject,
                fetchVisualizationClass,
                uriResolver,
                intl,
            };

            const wrapper = mount(<VisualizationWrapped {...props as any} />);

            return testUtils.delay(SLOW + 1).then(() => {
                wrapper.update();
                const BaseChartElement = wrapper.find(BaseChart).get(0);
                expect(BaseChartElement.props.config.colorPalette).toEqual(expectedColorPalette);
                expect(mutatedSdk.project.getColorPaletteWithGuids).toHaveBeenCalledTimes(0);
            });
        });

        it("should get palette from sdk and render BaseChart with this palette when no colors/palette in props", () => {
            const mutatedSdk = {
                ...sdk,
                clone: () => mutatedSdk,
                project: {
                    ...sdk.project,
                    getColorPaletteWithGuids: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve(expectedColorPalette)),
                },
            };

            const props = {
                sdk: mutatedSdk,
                projectId,
                identifier: CHART_IDENTIFIER,
                BaseChartComponent: BaseChart,
                LoadingComponent,
                ErrorComponent,
                fetchVisObject,
                fetchVisualizationClass,
                uriResolver,
                intl,
            };

            const wrapper = mount(<VisualizationWrapped {...props as any} />);

            return testUtils.delay(SLOW + 1).then(() => {
                wrapper.update();
                const BaseChartElement = wrapper.find(BaseChart).get(0);
                expect(mutatedSdk.project.getColorPaletteWithGuids).toHaveBeenCalledTimes(1);
                expect(BaseChartElement.props.config.colorPalette).toEqual(expectedColorPalette);
            });
        });

        it("should not call getColorPalette with unchanged SDK", () => {
            const mutatedSdk = {
                ...sdk,
                clone: () => cloneDeep(mutatedSdk),
                project: {
                    ...sdk.project,
                    getColorPaletteWithGuids: jest.fn(() => Promise.resolve()),
                },
            };

            const props = {
                sdk: mutatedSdk,
                projectId,
                identifier: CHART_IDENTIFIER,
                BaseChartComponent: BaseChart,
                LoadingComponent,
                ErrorComponent,
                fetchVisObject,
                fetchVisualizationClass,
                uriResolver,
                intl,
            };

            const wrapper = mount(<VisualizationWrapped {...props as any} />);

            return testUtils.delay(FAST + 1).then(() => {
                wrapper.update();
                expect(mutatedSdk.project.getColorPaletteWithGuids).toHaveBeenCalledTimes(1);
                wrapper.setProps({
                    config: {
                        grid: {
                            enabled: false,
                        },
                    },
                    sdk: mutatedSdk,
                });
                expect(mutatedSdk.project.getColorPaletteWithGuids).toHaveBeenCalledTimes(1);
            });
        });
    });

    it("should add default sorting to the Treemap", () => {
        const props = {
            sdk,
            projectId,
            uri: TREEMAP_URI,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            intl,
            BaseChartComponent: BaseChart,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        return testUtils.delay(FAST + 1).then(() => {
            wrapper.update();
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.resultSpec).toEqual({
                dimensions: [
                    {
                        itemIdentifiers: [
                            "02b7736f6bef48b1849798e430d837df",
                            "bc5257e06a9342ec99854bd1a53f3262",
                        ],
                    },
                    {
                        itemIdentifiers: ["measureGroup"],
                    },
                ],
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "02b7736f6bef48b1849798e430d837df",
                            direction: "asc",
                        },
                    },
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "b5a12d1bf094469d9b4e7d5d2bb87287",
                                    },
                                },
                            ],
                        },
                    },
                ],
            });
        });
    });

    it("should call getFeatureFlags", async () => {
        const getFeatureFlags = jest.fn(() => Promise.resolve({}));

        const props = {
            sdk,
            projectId,
            identifier: CHART_IDENTIFIER,
            BaseChartComponent: BaseChart,
            LoadingComponent,
            ErrorComponent,
            fetchVisObject,
            fetchVisualizationClass,
            uriResolver,
            getFeatureFlags,
            intl,
        };

        const wrapper = mount(<VisualizationWrapped {...props as any} />);

        await testUtils.delay(SLOW + 1);
        wrapper.update();
        expect(getFeatureFlags).toHaveBeenCalledTimes(1);
    });
});
