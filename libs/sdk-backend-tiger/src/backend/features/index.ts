// (C) 2020-2024 GoodData Corporation
import {
    IStaticFeatures,
    IUserProfile,
    ILiveFeatures,
    FeatureContext,
    DeclarativeWorkspace,
    ApiEntitlement,
    ApiEntitlementNameEnum,
} from "@gooddata/api-client-tiger";
import { LRUCache } from "lru-cache";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { ITigerFeatureFlags, DefaultFeatureFlags } from "../uiFeatures.js";

import { getFeatureHubFeatures } from "./hub.js";
import { getStaticFeatures } from "./static.js";

const getKeyFromContext = (wsContext?: Partial<FeatureContext>): string => {
    return `${wsContext?.organizationId}-${wsContext?.earlyAccessValues?.join(",")}`;
};
const responseMap: LRUCache<string, Promise<ITigerFeatureFlags>> = new LRUCache<
    string,
    Promise<ITigerFeatureFlags>
>({
    max: 10,
});

export class TigerFeaturesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getFeatures(
        profile?: IUserProfile,
        wsContext?: Partial<FeatureContext>,
    ): Promise<ITigerFeatureFlags> {
        const cachedResponse = responseMap.get(getKeyFromContext(wsContext));
        if (cachedResponse) {
            return cachedResponse;
        }
        const response = this.authCall(async (client) => {
            const prof = profile || (await client.profile.getCurrent());
            const results = await loadFeatures(prof, wsContext);

            return {
                ...DefaultFeatureFlags,
                ...results,
                enableScheduling: false,
                enableAlerting: false,
            };
        });
        responseMap.set(getKeyFromContext(wsContext), response);
        return response;
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

export function pickContext(
    attributes: Partial<DeclarativeWorkspace> | undefined,
    organizationId: string | undefined,
    entitlements: ApiEntitlement[],
): Partial<FeatureContext> {
    const context: Partial<FeatureContext> = {};
    const tier = getOrganizationTier(entitlements);

    if (attributes?.earlyAccessValues !== undefined) {
        context.earlyAccessValues = attributes.earlyAccessValues;
    }

    if (organizationId !== undefined) {
        context.organizationId = organizationId;
    }

    if (tier !== undefined) {
        context.tier = tier;
    }

    return context;
}

export const getOrganizationTier = (entitlements: ApiEntitlement[] = []) => {
    const tierEntitlement = entitlements.find(
        (entitlement) => entitlement.name === ApiEntitlementNameEnum.TIER,
    );

    return tierEntitlement?.value;
};
