// (C) 2007-2019 GoodData Corporation
import { IFeatureFlags, SDK } from "@gooddata/gooddata-js";
import { getCachedOrLoad } from "./sdkCache";

export async function getFeatureFlags(sdk: SDK, projectId: string): Promise<IFeatureFlags> {
    const apiCallIdentifier = `getFeatureFlags.${projectId}`;
    const loader = () => sdk.project.getFeatureFlags(projectId);
    try {
        return getCachedOrLoad(apiCallIdentifier, loader);
    } catch (error) {
        // tslint:disable-next-line:no-console
        console.error(`unable to retrieve featureFlags for project ${projectId}`, error);
        throw Error(error);
    }
}
