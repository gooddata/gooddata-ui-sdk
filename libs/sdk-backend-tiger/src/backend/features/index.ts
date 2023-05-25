// (C) 2020-2023 GoodData Corporation
import {
    IStaticFeatures,
    IUserProfile,
    ILiveFeatures,
    FeatureContext,
    JsonApiWorkspaceInAttributes,
} from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { ITigerFeatureFlags, DefaultFeatureFlags } from "../uiFeatures.js";

import { getFeatureHubFeatures } from "./hub.js";
import { getStaticFeatures } from "./static.js";

export class TigerFeaturesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getFeatures(
        profile?: IUserProfile,
        wsContext?: Partial<FeatureContext>,
    ): Promise<ITigerFeatureFlags> {
        return this.authCall(async (client) => {
            const prof = profile || (await client.profile.getCurrent());
            const results = await loadFeatures(prof, wsContext);

            return {
                ...DefaultFeatureFlags,
                ...results,
            };
        });
    }
}

async function loadFeatures(
    profile: IUserProfile,
    wsContext: Partial<FeatureContext> = {},
): Promise<Partial<ITigerFeatureFlags>> {
    const features = profile.features || {};

    if (featuresAreLive(features)) {
        return await getFeatureHubFeatures(features.live, wsContext);
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

export function pickContext(attributes: JsonApiWorkspaceInAttributes | undefined): Partial<FeatureContext> {
    const context: Partial<FeatureContext> = {};

    if (attributes?.["earlyAccess"] !== undefined) {
        context.earlyAccess = attributes["earlyAccess"];
    }
    return context;
}
