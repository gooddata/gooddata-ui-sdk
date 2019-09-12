// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";

import { DataTable } from "../DataTable";
import { IDataSource } from "../interfaces/DataSource";
import { DummyAdapter } from "../utils/DummyAdapter";
import { DummyDataSource } from "../utils/DummyDataSource";
import { ISimpleExecutorResult } from "../../interfaces";

describe("DataTable", () => {
    const dataResponse: ISimpleExecutorResult = { rawData: [["1", "2", "3"]] };
    const afm: AFM.IAfm = {
        attributes: [
            {
                localIdentifier: "a1-local-identifier",
                displayForm: {
                    identifier: "a1-identifier",
                },
            },
        ],
        measures: [
            {
                localIdentifier: "m1-local-identifier",
                definition: {
                    measure: {
                        item: {
                            identifier: "m1-identifier",
                        },
                    },
                },
            },
        ],
    };
    const afm2: AFM.IAfm = {
        measures: [
            {
                localIdentifier: "c",
                definition: {
                    measure: {
                        item: {
                            identifier: "d",
                        },
                    },
                },
            },
        ],
    };
    const nonExecutableAfm: AFM.IAfm = {};
    const emptyResultSpec: AFM.IResultSpec = {};
    const defaultDimensionsForTable: AFM.IDimension[] = [
        {
            itemIdentifiers: ["a1-local-identifier"],
        },
        {
            itemIdentifiers: ["measureGroup"],
        },
    ];

    const setupDataTable = (success = true, dataSource: any = null, dataCb = jest.fn()) => {
        const dt = new DataTable(new DummyAdapter(dataResponse, success, dataSource));
        const errCb = jest.fn();

        dt.onData(dataCb);
        dt.onError(errCb);

        return {
            dt,
            dataCb,
            errCb,
        };
    };

    describe("Events", () => {
        it("should return data via onData callback", done => {
            const { dt, errCb, dataCb } = setupDataTable();

            dt.getData(afm, emptyResultSpec);

            setTimeout(() => {
                expect(errCb).not.toBeCalled();
                expect(dataCb).toHaveBeenCalledWith(dataResponse);

                done();
            }, 0);
        });

        it("should dispatch onError callback when error occurs", done => {
            const { dt, errCb, dataCb } = setupDataTable(false);

            dt.getData(afm, emptyResultSpec);

            setTimeout(() => {
                expect(dataCb).not.toBeCalled();
                expect(errCb).toHaveBeenCalled();

                done();
            }, 0);
        });

        it("should not get new data for invalid AFM", done => {
            const { dt, errCb, dataCb } = setupDataTable();

            dt.getData(nonExecutableAfm, emptyResultSpec);

            setTimeout(() => {
                expect(dataCb).not.toBeCalled();
                expect(errCb).not.toBeCalled();

                done();
            }, 0);
        });

        it("should be able to reset subscribers", done => {
            const { dt, errCb, dataCb } = setupDataTable();

            dt.onData(dataCb);
            dt.onError(errCb);

            dt.resetDataSubscribers().resetErrorSubscribers();

            dt.getData(nonExecutableAfm, emptyResultSpec);

            setTimeout(() => {
                expect(dataCb).not.toBeCalled();
                expect(errCb).not.toBeCalled();

                done();
            }, 0);
        });

        it("should call handler only once", done => {
            const { dt, errCb, dataCb } = setupDataTable();

            dt.getData(afm, emptyResultSpec);
            dt.getData(afm2, emptyResultSpec);

            setTimeout(() => {
                try {
                    expect(dataCb).toHaveBeenCalledTimes(1);
                    expect(errCb).not.toHaveBeenCalled();

                    done();
                } catch (error) {
                    done(error);
                }
            }, 0);
        });
    });

    describe("ResultSpec", () => {
        function getDummyDataSource() {
            return new DummyDataSource<any>(dataResponse, true);
        }

        function getDataTable(dataSource: IDataSource<any>) {
            return new DataTable(new DummyAdapter(dataResponse, true, dataSource));
        }

        it("should use default dimensions for table, when no resultSpec is passed", done => {
            const dataSource = getDummyDataSource();
            const dt = getDataTable(dataSource);

            dt.onError(done);
            dt.onData(() => {
                try {
                    expect(dataSource.getResultSpec()).toEqual({ dimensions: defaultDimensionsForTable });
                    done();
                } catch (error) {
                    done(error);
                }
            });
            dt.getData(afm);
        });

        it("should use default dimensions for table, when no resultSpec is defined", done => {
            const dataSource = getDummyDataSource();
            const dt = getDataTable(dataSource);

            dt.onError(done);
            dt.onData(() => {
                try {
                    expect(dataSource.getResultSpec()).toEqual({ dimensions: defaultDimensionsForTable });
                    done();
                } catch (error) {
                    done(error);
                }
            });
            dt.getData(afm, emptyResultSpec);
        });

        it("should use default dimensions for table, when no dimensions is defined", done => {
            const resultSpecWithoutDimensions: AFM.IResultSpec = {
                sorts: [
                    {
                        attributeSortItem: {
                            direction: "desc",
                            attributeIdentifier: "a1-local-identifier",
                        },
                    },
                ],
            };

            const dataSource = getDummyDataSource();
            const dt = getDataTable(dataSource);

            dt.onError(done);
            dt.onData(() => {
                try {
                    expect(dataSource.getResultSpec()).toEqual({
                        dimensions: defaultDimensionsForTable,
                        sorts: [
                            {
                                attributeSortItem: {
                                    direction: "desc",
                                    attributeIdentifier: "a1-local-identifier",
                                },
                            },
                        ],
                    });
                    done();
                } catch (error) {
                    done(error);
                }
            });
            dt.getData(afm, resultSpecWithoutDimensions);
        });

        it("should use custom defined dimensions", done => {
            const baseChartResultSpec: AFM.IResultSpec = {
                dimensions: [
                    {
                        itemIdentifiers: ["measureGroup"],
                    },
                    {
                        itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier),
                    },
                ],
            };

            const dataSource = getDummyDataSource();
            const dt = getDataTable(dataSource);

            dt.onError(done);
            dt.onData(() => {
                try {
                    expect(dataSource.getResultSpec()).toEqual(baseChartResultSpec);
                    done();
                } catch (error) {
                    done(error);
                }
            });
            dt.getData(afm, baseChartResultSpec);
        });
    });
});
