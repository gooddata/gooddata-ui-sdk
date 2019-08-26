// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { Execution, AFM } from "@gooddata/typings";
import { testUtils } from "@gooddata/js-utils";
import {
    IBucketExecutorProps,
    getExecutionFromDimensions,
    IBucketExecutorChildrenProps,
} from "../BucketExecutor";
import { BucketExecutor, Model, ErrorStates } from "../..";

describe("getExecutionFromDimensions", () => {
    const m1 = Model.measure("m0");
    const m2 = Model.measure("m1");
    const a1 = Model.attribute("a0");
    const a2 = Model.attribute("a1");
    const noFilters: IBucketExecutorProps["filters"] = [];
    const sampleFilters: IBucketExecutorProps["filters"] = [
        Model.attributeFilter("a1").in("sample attribute value", "other attribute value"),
        Model.absoluteDateFilter("a1", "2019-01-01", "2019-02-01"),
    ];
    const noSortBy: IBucketExecutorProps["sortBy"] = [];
    const sampleSortBy: IBucketExecutorProps["sortBy"] = [
        Model.attributeSortItem("a2", "desc"),
        Model.measureSortItem("m0", "desc").attributeLocators({
            attributeIdentifier: "a2",
            element: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
        }),
    ];
    const sampleDimensions: IBucketExecutorProps["dimensions"] = [[a1], [a2, m1, m2]];

    it("should collect measures and attributes, setup a RS dimensions with a measure group in the same dimension where all the measures are defined", () => {
        const actualExecution = getExecutionFromDimensions(sampleDimensions, noFilters, noSortBy);
        const expectedMeasures: AFM.IMeasure[] = [
            {
                definition: {
                    measure: {
                        item: {
                            identifier: "m0",
                        },
                    },
                },
                localIdentifier: "m_0",
            },
            {
                definition: {
                    measure: {
                        item: {
                            identifier: "m1",
                        },
                    },
                },
                localIdentifier: "m_1",
            },
        ];
        expect(actualExecution.execution.afm.measures).toEqual(expectedMeasures);
        const expectedDimensions: AFM.IDimension[] = [
            { itemIdentifiers: ["va_0"] },
            { itemIdentifiers: ["va_1", "measureGroup"] },
        ];
        expect(actualExecution.execution.resultSpec.dimensions).toEqual(expectedDimensions);
    });
    it("should pass filters to AFM", () => {
        const actualExecution = getExecutionFromDimensions(sampleDimensions, sampleFilters, noSortBy);
        const expectedFilters: AFM.FilterItem[] = [
            {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "a1",
                    },
                    in: ["sample attribute value", "other attribute value"],
                    textFilter: true,
                },
            },
            {
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "a1",
                    },
                    from: "2019-01-01",
                    to: "2019-02-01",
                },
            },
        ];
        expect(actualExecution.execution.afm.filters).toEqual(expectedFilters);
    });
    it("should pass sortBy to AFM", () => {
        const actualExecution = getExecutionFromDimensions(sampleDimensions, noFilters, sampleSortBy);
        const expectedSorts: AFM.SortItem[] = [
            {
                attributeSortItem: {
                    attributeIdentifier: "a2",
                    direction: "desc",
                },
            },
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "a2",
                                element:
                                    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
                            },
                        },
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m0",
                            },
                        },
                    ],
                },
            },
        ];
        const sanitizedActualSorts = JSON.parse(JSON.stringify(actualExecution.execution.resultSpec.sorts));
        expect(sanitizedActualSorts).toEqual(expectedSorts);
    });
});
describe("BucketExecutor", () => {
    const createSdk: any = (
        getMockResponse: () => Promise<Execution.IExecutionResponse> = getSampleResponse,
        getMockResult: () => Promise<Execution.IExecutionResult> = getSampleResult,
    ) => {
        return {
            clone: jest.fn(() => createSdk(getMockResponse, getMockResult)),
            config: {
                setJsPackage: jest.fn(),
                setRequestHeader: jest.fn(),
            },
            execution: {
                getExecutionResponse: jest.fn(getMockResponse),
                getPartialExecutionResult: jest.fn(getMockResult),
            },
        };
    };

    const sampleResponse = {
        dimensions: [
            {
                headers: [
                    {
                        measureGroupHeader: {
                            items: [
                                {
                                    measureHeaderItem: {
                                        name: "$ Total Sales",
                                        format: "[>=0]$#,##0;[<0]-$#,##0",
                                        localIdentifier: "m_0",
                                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2352",
                                        identifier: "aa7ulGyKhIE5",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
        links: {
            executionResult:
                "/gdc/app/projects/xms7ga4tf3g3nzucd8380o2bev8oeknp/executionResults/2894865544222703104?q=eAEtjksPgjAQhP8KWThiSqhGgo%2Br8eJFPREOhRaC0i5piy%2FCf7eIt5md2S8zgBYdantiUkAKV2Ub%0A2woOIZTY9lIZSLM8BCmsbsrJDFChlsy6crbfRXngh74fbbJtlC9m7X5NLyXTb9dx5kd0MvAuaFnr%0AnVkrjLvPzCN3Eal5SSQnL2nWNVvaitZUffqSJzSJMC7EI0FxVx3B4kZiuophdKM0PqdFf9BBY99B%0APn4BQAVCuw%3D%3D%0A&c=41e0580ecc341e17a2a1cf208340807b&offset=0%2C0&limit=1000%2C1000&dimensions=1&totals=0",
        },
    };

    const getSampleResponse = (): Promise<Execution.IExecutionResponse> => {
        return Promise.resolve(sampleResponse);
    };

    const sampleResult = {
        data: ["92556577.3"],
        paging: {
            count: [1],
            offset: [0],
            total: [1],
        },
        headerItems: [
            [
                [
                    {
                        measureHeaderItem: {
                            name: "$ Total Sales",
                            order: 0,
                        },
                    },
                ],
            ],
        ],
    };

    const getSampleResult = (): Promise<Execution.IExecutionResult> => {
        return Promise.resolve(sampleResult);
    };

    const createChildrenFunction = (children: React.ReactNode = null) => jest.fn(() => children);

    const createComponent = (
        children: (params: IBucketExecutorChildrenProps) => React.ReactNode = createChildrenFunction(),
        dimensions: IBucketExecutorProps["dimensions"],
        additionalProps: Partial<IBucketExecutorProps> = {},
    ) => {
        const props: IBucketExecutorProps = {
            projectId: "foo",
            sdk: createSdk(getSampleResponse, getSampleResult),
            children,
            dimensions,
            ...additionalProps,
        };

        return mount(<BucketExecutor {...props} />);
    };

    it("should render children returned from childrenFunction", () => {
        const MockChild = () => <div />;
        const childrenFunction = createChildrenFunction(<MockChild />);
        const wrapper = createComponent(childrenFunction, [[Model.measure("m1")]]);
        return testUtils.delay().then(() => {
            wrapper.update();
            const childComponent = wrapper.find(MockChild);
            expect(childComponent.length).toBe(1);
        });
    });

    describe("with autoLoadFirstPage: true", () => {
        it("should automatically load response and result, should only load result when getPage is called", () => {
            const childrenFunction = jest.fn(() => null);
            const mockSdk = createSdk();

            const wrapper = createComponent(childrenFunction, [[Model.measure("m1")]], {
                sdk: mockSdk,
            });

            const loadingElement = wrapper.find("LoadingComponent");
            expect(loadingElement.length).toBe(1);

            return testUtils.delay().then(() => {
                wrapper.update();
                const lastChildrenCallParams =
                    childrenFunction.mock.calls[childrenFunction.mock.calls.length - 1];
                const { getPage } = (lastChildrenCallParams as any)[0];
                const sdk = (wrapper.instance() as any).sdk;

                const { getExecutionResponse, getPartialExecutionResult } = sdk.execution;
                expect(getExecutionResponse).toHaveBeenCalledTimes(1);
                expect(getPartialExecutionResult).toHaveBeenCalledTimes(1);

                expect(childrenFunction).toHaveBeenLastCalledWith({
                    response: sampleResponse,
                    result: sampleResult,
                    getPage,
                });

                getPage({ offset: [0, 0], limit: [1, 1] });

                return testUtils.delay().then(() => {
                    wrapper.update();
                    expect(getExecutionResponse).toHaveBeenCalledTimes(1);
                    expect(getPartialExecutionResult).toHaveBeenCalledTimes(2);
                    expect(childrenFunction).toHaveBeenLastCalledWith({
                        response: sampleResponse,
                        result: sampleResult,
                        getPage,
                    });
                });
            });
        });
    });

    describe("with autoLoadFirstPage: false", () => {
        it("should only load response and result after getPage was called", () => {
            const childrenFunction = jest.fn(() => null);
            const mockSdk = createSdk();

            const wrapper = createComponent(childrenFunction, [[Model.measure("m1")]], {
                autoLoadFirstPage: false,
                sdk: mockSdk,
            });

            const lastChildrenCallParams =
                childrenFunction.mock.calls[childrenFunction.mock.calls.length - 1];
            const { getPage } = (lastChildrenCallParams as any)[0];

            expect(childrenFunction).toHaveBeenCalledWith({
                response: null,
                result: null,
                getPage,
            });

            return testUtils.delay().then(() => {
                wrapper.update();

                const sdk = (wrapper.instance() as any).sdk;
                const { getExecutionResponse, getPartialExecutionResult } = sdk.execution;

                expect(getExecutionResponse).not.toHaveBeenCalled();
                expect(getPartialExecutionResult).not.toHaveBeenCalled();
                expect(childrenFunction).toHaveBeenLastCalledWith({
                    response: null,
                    result: null,
                    getPage,
                });

                getPage({ offset: [0, 0], limit: [1, 1] });

                return testUtils.delay().then(() => {
                    wrapper.update();

                    expect(getExecutionResponse).toHaveBeenCalledTimes(1);
                    expect(getPartialExecutionResult).toHaveBeenCalledTimes(1);
                    expect(childrenFunction).toHaveBeenLastCalledWith({
                        response: sampleResponse,
                        result: sampleResult,
                        getPage,
                    });
                });
            });
        });
    });

    it("should pass error to the childrenFunction when response request returns an error and should be able to recover from this error", () => {
        const childrenFunction = jest.fn(() => null);
        const errorText = "response error";
        let throwError = true;
        const mockSdk = createSdk(() =>
            throwError ? Promise.reject({ response: errorText }) : Promise.resolve(sampleResponse),
        );

        const wrapper = createComponent(childrenFunction, [[Model.measure("m1")]], {
            sdk: mockSdk,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const errorElement = wrapper.find("ErrorComponent");

            const getPage: IBucketExecutorChildrenProps["getPage"] = errorElement.prop("getPage");

            expect(errorElement.prop("message")).toBe(ErrorStates.UNKNOWN_ERROR);
            expect(getPage).not.toBe(undefined);

            // make sdk resolve OK and retry
            throwError = false;
            getPage({ offset: [0, 0], limit: [1, 1] });

            return testUtils.delay().then(() => {
                wrapper.update();

                const errorElement = wrapper.find("ErrorComponent");

                expect(errorElement.length).toBe(0);
                expect(childrenFunction).toHaveBeenCalledTimes(1);
            });
        });
    });

    it("should pass error to the childrenFunction when result request returns an error and should be able to recover from this error", () => {
        const childrenFunction = jest.fn(() => null);
        const errorText = "response error";
        let throwError = true;
        const mockSdk = createSdk(getSampleResponse, () =>
            throwError ? Promise.reject({ response: errorText }) : Promise.resolve(sampleResult),
        );

        const wrapper = createComponent(childrenFunction, [[Model.measure("m1")]], {
            sdk: mockSdk,
        });

        return testUtils.delay().then(() => {
            wrapper.update();
            const errorElement = wrapper.find("ErrorComponent");

            const getPage: IBucketExecutorChildrenProps["getPage"] = errorElement.prop("getPage");

            expect(errorElement.prop("message")).toBe(ErrorStates.UNKNOWN_ERROR);
            expect(getPage).not.toBe(undefined);

            // make sdk resolve OK and retry
            throwError = false;
            getPage({ offset: [0, 0], limit: [1, 1] });

            return testUtils.delay().then(() => {
                wrapper.update();

                const errorElement = wrapper.find("ErrorComponent");

                expect(errorElement.length).toBe(0);
                expect(childrenFunction).toHaveBeenCalledTimes(1);
            });
        });
    });
});
