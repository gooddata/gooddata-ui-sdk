// (C) 2007-2018 GoodData Corporation
import stringify from "json-stable-stringify";
import { AFM } from "@gooddata/typings";
import { DataSource } from "../DataSource";

const DEFAULT_LIMIT = 1000;

describe("DataSource", () => {
    beforeEach(() => {
        expect.hasAssertions();
    });

    const afm: AFM.IAfm = { measures: [], filters: [], attributes: [] };
    const resultSpec: AFM.IResultSpec = {};

    it("should call execfactory for getData", () => {
        const result = Promise.resolve();
        const execFactory = jest.fn().mockReturnValue(result);
        const dataSource = new DataSource(execFactory, afm);

        const dataPromise = dataSource.getData(resultSpec);
        expect(dataPromise).toEqual(result);
    });

    it("should return afm", () => {
        const execFactory = (): Promise<number> => Promise.resolve(1);
        const dataSource = new DataSource(execFactory, afm);

        expect(dataSource.getAfm()).toEqual(afm);
    });

    it("should return correct fingerprint", () => {
        const execFactory = () => Promise.resolve({});
        const dataSource = new DataSource(execFactory, afm);

        expect(dataSource.getFingerprint()).toEqual(stringify(afm));
    });

    it("should return explicit fingerprint when provided", () => {
        const execFactory = () => Promise.resolve({});
        const dataSource = new DataSource(execFactory, afm, "myFingerprint");

        expect(dataSource.getFingerprint()).toEqual("myFingerprint");
    });

    it("should not call response and result factories", () => {
        const execFactoryPromise = Promise.resolve();
        const execFactory = jest.fn().mockReturnValue(execFactoryPromise);
        const responseFactory = jest.fn();
        const resultFactory = jest.fn();

        const dataSource = new DataSource(execFactory, afm, "finger", responseFactory, resultFactory);
        const dataPromise = dataSource.getData(resultSpec);
        expect(dataPromise).toEqual(execFactoryPromise);
        expect(responseFactory).not.toBeCalled();
        expect(resultFactory).not.toBeCalled();
    });

    describe("getPage", () => {
        const createDataSource = () => {
            const execFactory = jest.fn().mockReturnValue(Promise.resolve());
            const responseFactory = jest
                .fn()
                .mockReturnValueOnce(Promise.resolve({ links: { executionResult: "url1" } }))
                .mockReturnValueOnce(Promise.resolve({ links: { executionResult: "urlRS2" } }));
            const resultFactory = jest
                .fn()
                .mockReturnValueOnce(Promise.resolve({ data: [] }))
                .mockReturnValueOnce(Promise.resolve({ data: [[]] }))
                .mockReturnValueOnce(Promise.resolve({ data: [[], []] }));

            const dataSource = new DataSource(execFactory, afm, "finger", responseFactory, resultFactory);
            return { responseFactory, resultFactory, dataSource };
        };

        it("should throw when missing responseFactory", () => {
            const execFactory = jest.fn().mockReturnValue(Promise.resolve());
            const responseFactory = undefined;
            const resultFactory = jest.fn();

            const dataSource = new DataSource(execFactory, afm, "finger", responseFactory, resultFactory);
            expect(() => {
                dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            }).toThrow();
        });

        it("should throw when missing resultFactory", async () => {
            const execFactory = jest.fn().mockReturnValue(Promise.resolve());
            const responseFactory = jest
                .fn()
                .mockReturnValue(Promise.resolve({ links: { executionResult: "url1" } }));
            const resultFactory = undefined;

            const dataSource = new DataSource(execFactory, afm, "finger", responseFactory, resultFactory);
            try {
                await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("should use responseFactory+resultFactory", async () => {
            const { responseFactory, resultFactory, dataSource } = createDataSource();
            const responses = await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);

            expect(responseFactory).toBeCalledWith(resultSpec);
            expect(resultFactory).toBeCalledWith("url1", [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            expect(responses).toEqual({
                executionResponse: { links: { executionResult: "url1" } },
                executionResult: { data: [] },
            });
        });

        it("should cache first response", async () => {
            const { responseFactory, resultFactory, dataSource } = createDataSource();
            await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            const responses2 = await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [10, 10]);

            expect(responseFactory).toHaveBeenCalledTimes(1);
            expect(resultFactory).toHaveBeenCalledTimes(2);
            expect(resultFactory.mock.calls[0]).toEqual(["url1", [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]]);
            expect(resultFactory.mock.calls[1]).toEqual(["url1", [DEFAULT_LIMIT, DEFAULT_LIMIT], [10, 10]]);
            expect(responses2).toEqual({
                executionResponse: { links: { executionResult: "url1" } },
                executionResult: { data: [[]] },
            });
        });

        it("should be able to handle two different result spec requests", async () => {
            const resultSpec2: AFM.IResultSpec = { dimensions: [] };
            const { responseFactory, resultFactory, dataSource } = createDataSource();
            await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            await dataSource.getPage(resultSpec, [DEFAULT_LIMIT, DEFAULT_LIMIT], [10, 10]);
            const responsesRS2 = await dataSource.getPage(
                resultSpec2,
                [DEFAULT_LIMIT, DEFAULT_LIMIT],
                [0, 0],
            );

            expect(responseFactory).toHaveBeenCalledTimes(2);
            expect(resultFactory).toHaveBeenCalledTimes(3);
            expect(resultFactory.mock.calls[2]).toEqual(["urlRS2", [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]]);
            expect(responsesRS2).toEqual({
                executionResponse: { links: { executionResult: "urlRS2" } },
                executionResult: { data: [[], []] },
            });
        });

        it("should limit page size by server limit", async () => {
            const consoleWarnSpy = jest.spyOn(global.console, "warn");
            consoleWarnSpy.mockImplementation(jest.fn());

            const { responseFactory, resultFactory, dataSource } = createDataSource();
            const overLimit = [DEFAULT_LIMIT + 2, DEFAULT_LIMIT + 2];
            const responses = await dataSource.getPage(resultSpec, overLimit, [0, 0]);

            expect(responseFactory).toBeCalledWith(resultSpec);
            expect(resultFactory).toBeCalledWith("url1", [DEFAULT_LIMIT, DEFAULT_LIMIT], [0, 0]);
            expect(responses).toEqual({
                executionResponse: { links: { executionResult: "url1" } },
                executionResult: { data: [] },
            });
            expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

            consoleWarnSpy.mockRestore();
        });

        it("should work with a single dimension", async () => {
            const { responseFactory, resultFactory, dataSource } = createDataSource();
            const responses = await dataSource.getPage(resultSpec, [DEFAULT_LIMIT], [0]);

            expect(responseFactory).toHaveBeenCalledTimes(1);
            expect(resultFactory).toHaveBeenCalledTimes(1);
            expect(resultFactory).toHaveBeenCalledWith("url1", [DEFAULT_LIMIT], [0]);
            expect(responses).toEqual({
                executionResponse: { links: { executionResult: "url1" } },
                executionResult: { data: [] },
            });
        });
    });
});
