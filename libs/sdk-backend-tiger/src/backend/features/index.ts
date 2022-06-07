// (C) 2020-2022 GoodData Corporation
import { IStaticFeatures, IUserProfile, ILiveFeatures } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../types";
import { ITigerFeatureFlags, DefaultFeatureFlags } from "../uiFeatures";

import { getFeatureHubFeatures } from "./hub";
import { getStaticFeatures } from "./static";

export class TigerFeaturesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getFeatures(profile?: IUserProfile): Promise<ITigerFeatureFlags> {
        return this.authCall(async (client) => {
            const prof = profile || (await client.profile.getCurrent());
            const results = await loadFeatures(prof);

            return {
                ...DefaultFeatureFlags,
                ...results,
            };
        });
    }
}

async function loadFeatures(profile: IUserProfile): Promise<Partial<ITigerFeatureFlags>> {
    const features = profile.features || {};

    if (featuresAreLive(features)) {
        return await getFeatureHubFeatures(features.live);
    }

    if (featuresAreStatic(features)) {
        return await getStaticFeatures(features.static);
    }
    return Promise.resolve({});
}

function featuresAreLive(item: any): item is ILiveFeatures {
    return Boolean(item?.live);
}

function featuresAreStatic(item: any): item is IStaticFeatures {
    return Boolean(item?.static);
}
