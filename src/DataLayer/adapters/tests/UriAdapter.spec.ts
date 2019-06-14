// (C) 2007-2018 GoodData Corporation
import "isomorphic-fetch";
import { charts } from "../../converters/tests/fixtures/VisObj.fixtures";
import { UriAdapter } from "../UriAdapter";
import { factory, SDK } from "../../../gooddata";
import { ApiResponse } from "../../../xhr";

const sdk = factory(fetch)();

describe("UriAdapter", () => {
    const projectId = "FoodMartDemo";
    const uri = "/gdc/md/FoodMartDemo/1";
    const uri2 = "/gdc/md/FoodMartDemo/2";

    function createDummySDK(): SDK {
        const visualizationObject = {
            visualizationObject: {
                content: charts.simpleMeasure,
            },
        };

        sdk.clone = () => sdk; // disable clone for spyOn to work

        jest.spyOn(sdk.xhr, "get").mockImplementation(() =>
            Promise.resolve(new ApiResponse(new Response(), JSON.stringify(visualizationObject))),
        );

        return sdk;
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch visualization object when creating data source", () => {
        const dummySDK = createDummySDK();
        const adapter = new UriAdapter(dummySDK, projectId);
        return adapter.createDataSource({ uri }).then(() => {
            expect(dummySDK.xhr.get).toBeCalledWith(uri);
        });
    });

    it("should handle fail of vis. obj. fetch", () => {
        const dummySDK = createDummySDK();
        const adapter = new UriAdapter(dummySDK, projectId);
        dummySDK.xhr.get = jest.fn(() => Promise.reject("invalid URI"));
        return adapter.createDataSource({ uri }).catch(error => {
            expect(error).toBe("invalid URI");
        });
    });

    it("should request visualization object for consecutive createDataSource call only when uri changes", () => {
        const dummySDK = createDummySDK();
        const adapter = new UriAdapter(dummySDK, projectId);
        return adapter.createDataSource({ uri }).then(() => {
            expect(dummySDK.xhr.get).toHaveBeenCalledTimes(1);
            return adapter.createDataSource({ uri }).then(() => {
                expect(dummySDK.xhr.get).toHaveBeenCalledTimes(1);
                return adapter.createDataSource({ uri: uri2 }).then(() => {
                    expect(dummySDK.xhr.get).toHaveBeenCalledTimes(2);
                });
            });
        });
    });
});
