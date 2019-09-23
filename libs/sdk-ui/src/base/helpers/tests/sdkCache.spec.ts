// (C) 2007-2019 GoodData Corporation
import { getCachedOrLoad, clearSdkCache } from "../sdkCache";

describe("sdkCache", () => {
    const loader = jest.fn(() => Promise.resolve(5));
    afterEach(() => {
        loader.mockClear();
        clearSdkCache(); // because of global object of cache
    });
    describe("getCachedOrLoad", () => {
        it("should cache first result and re-use it for second call", async () => {
            let result = await getCachedOrLoad("call", loader);
            expect(result).toBe(5);
            expect(loader).toHaveBeenCalledTimes(1);

            result = await getCachedOrLoad("call", loader);
            expect(result).toBe(5);
            expect(loader).toHaveBeenCalledTimes(1);
        });

        it("should cache according call identifier", async () => {
            await getCachedOrLoad("call1", loader);
            expect(loader).toHaveBeenCalledTimes(1);
            await getCachedOrLoad("call2", loader);
            expect(loader).toHaveBeenCalledTimes(2);
        });
    });

    describe("clearSdkCache", () => {
        it("should clear whole cache", async () => {
            await getCachedOrLoad("call", loader);
            expect(loader).toHaveBeenCalledTimes(1);
            clearSdkCache();
            await getCachedOrLoad("call", loader);
            expect(loader).toHaveBeenCalledTimes(2);
        });
    });
});
