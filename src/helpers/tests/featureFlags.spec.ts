// (C) 2007-2019 GoodData Corporation
import { factory as createSdk, SDK } from "@gooddata/gooddata-js";
import { getFeatureFlags } from "../featureFlags";

describe("getFeatureFlags", () => {
    const projectId = "project";
    const featureFlags = { enablePivot: true };
    const getSdkWithFeatureFlags = (featureFlags = {}): SDK => {
        const mutatedSdk = createSdk();
        mutatedSdk.project.getFeatureFlags = jest.fn(() => Promise.resolve(featureFlags));
        return mutatedSdk;
    };

    it("should call sdk getFeatureFlags", async () => {
        const sdk = getSdkWithFeatureFlags(featureFlags);
        await getFeatureFlags(sdk, projectId);
        expect(sdk.project.getFeatureFlags).toHaveBeenCalledWith(projectId);
    });

    it("should return correct feature flags", async () => {
        const sdk = getSdkWithFeatureFlags(featureFlags);
        const resultFeatureFlags = await getFeatureFlags(sdk, projectId);
        expect(resultFeatureFlags).toEqual(featureFlags);
    });
});
