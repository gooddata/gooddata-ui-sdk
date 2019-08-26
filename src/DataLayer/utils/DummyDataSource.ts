// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IDataSource } from "../interfaces/DataSource";

function getExecutionResponse(numOfDimensions: number = 2): Execution.IExecutionResponse {
    const dimension = { headers: [] };

    return {
        dimensions: Array(numOfDimensions).fill(dimension),
        links: {
            executionResult: `/gdc/app/projects/myFakeProjectId/executionResults/123?limit=overridden&dimensions=${numOfDimensions}`, // tslint:disable-line:max-line-length
        },
    };
}

function getExecutionResult(): Execution.IExecutionResult {
    return {
        data: [[11, 12], [51, 52]],
        paging: {
            count: [2, 2],
            offset: [0, 0],
            total: [2, 2],
        },
        headerItems: [
            [
                [
                    {
                        attributeHeaderItem: {
                            name: "A1",
                            uri: "/gdc/md/obj/attr1",
                        },
                    },
                    {
                        attributeHeaderItem: {
                            name: "A2",
                            uri: "/gdc/md/obj/attr2",
                        },
                    },
                ],
            ],
            [
                [
                    {
                        measureHeaderItem: {
                            name: "M1",
                            order: 0,
                        },
                    },
                    {
                        measureHeaderItem: {
                            name: "M2",
                            order: 0,
                        },
                    },
                ],
            ],
        ],
    };
}

export class DummyDataSource<T> implements IDataSource<T> {
    private data: T;
    private resolve: boolean;
    private resultSpec: AFM.IResultSpec;

    constructor(data: T, resolve: boolean = true) {
        this.data = data;
        this.resolve = resolve;
        this.resultSpec = {};
    }

    public getData(resultSpec: AFM.IResultSpec): Promise<T> {
        this.resultSpec = resultSpec;

        if (this.resolve) {
            return Promise.resolve(this.data);
        }

        return Promise.reject("DummyDataSource reject");
    }

    public getPage(
        resultSpec: AFM.IResultSpec,
        _limit: number[],
        _offset: number[],
    ): Promise<Execution.IExecutionResponses> {
        this.resultSpec = resultSpec;

        if (this.resolve) {
            return Promise.resolve({
                executionResponse: getExecutionResponse(2),
                executionResult: getExecutionResult(),
            });
        }

        return Promise.reject("DummyDataSource reject");
    }

    public getFingerprint() {
        return "";
    }

    public getResultSpec() {
        return this.resultSpec;
    }

    public getAfm() {
        return {};
    }
}
