// (C) 2020-2026 GoodData Corporation

import { LRUCache } from "lru-cache";

import {
    type ApiEntitlement,
    type DeclarativeWorkspace,
    type FeatureContext,
    type ILiveFeatures,
    type IStaticFeatures,
    type IUserProfile,
} from "@gooddata/api-client-tiger";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";

import { LIB_VERSION } from "../../__version.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import {
    FEATURE_FLAG_OVERRIDES_GATE_FLAG,
    readFeatureFlagOverrides,
    rememberServerFeatureFlags,
    resolveFeatureFlagOverrides,
} from "../featureFlagOverrides.js";
import { DefaultFeatureFlags, type ITigerFeatureFlags, LocalFeatureFlagOverrides } from "../uiFeatures.js";

import { getFeatureHubFeatures } from "./hub.js";
import { getStaticFeatures } from "./static.js";

const getKeyFromContext = (wsContext?: Partial<FeatureContext>): string => {
    return `${wsContext?.organizationId}-${wsContext?.tier}-${
        wsContext?.jsSdkVersion
    }-${wsContext?.earlyAccessValues?.join(",")}`;
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
        workspaceId?: string,
    ): Promise<ITigerFeatureFlags> {
        const contextWithVersion: Partial<FeatureContext> = {
            ...wsContext,
            jsSdkVersion: LIB_VERSION,
        };
        // A changed or removed local override must not reuse a previously forced value.
        const key = JSON.stringify([
            getKeyFromContext(contextWithVersion),
            Object.entries(LocalFeatureFlagOverrides),
        ]);
        let response = responseMap.get(key);
        if (!response) {
            response = this.authCall(async (client) => {
                const prof = profile || (await ProfileApi_GetCurrent(client.axios));
                const results = await loadFeatures(prof, contextWithVersion);
                return { ...DefaultFeatureFlags, ...results };
            });
            responseMap.set(key, response);
        }
        const serverFeatures = await response;
        rememberServerFeatureFlags(withoutLocalOverrides(serverFeatures), workspaceId);
        const features = { ...serverFeatures, ...LocalFeatureFlagOverrides };
        const runtimeOverrides =
            features[FEATURE_FLAG_OVERRIDES_GATE_FLAG] === true
                ? await this.getRuntimeOverrides(profile, workspaceId)
                : {};
        return { ...features, ...runtimeOverrides, ...LocalFeatureFlagOverrides };
    }

    private async getRuntimeOverrides(
        profile: IUserProfile | undefined,
        workspaceId: string | undefined,
    ): Promise<Partial<ITigerFeatureFlags>> {
        const { rules } = readFeatureFlagOverrides();
        if (rules.length === 0) {
            return {};
        }
        const { organizationId, userId } =
            profile ?? (await this.authCall((client) => ProfileApi_GetCurrent(client.axios)));
        return resolveFeatureFlagOverrides(rules, { organizationId, workspaceId, userId });
    }
}

function withoutLocalOverrides(features: ITigerFeatureFlags): Partial<ITigerFeatureFlags> {
    const result: Partial<ITigerFeatureFlags> = { ...features };
    for (const name of Object.keys(LocalFeatureFlagOverrides)) {
        Reflect.deleteProperty(result, name);
    }
    return result;
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
        return getStaticFeatures(features.static);
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
    jsSdkVersion?: string,
): Partial<FeatureContext> {
    const context: Partial<FeatureContext> = {
        jsSdkVersion: jsSdkVersion ?? LIB_VERSION,
    };

    const tier = getOrganizationTier(entitlements);
    const controlledFeatureRollout = getControlledFeatureRollout(entitlements);

    if (attributes?.earlyAccessValues !== undefined) {
        context.earlyAccessValues = attributes.earlyAccessValues;
    }

    if (organizationId !== undefined) {
        context.organizationId = organizationId;
    }

    if (tier !== undefined) {
        context.tier = tier.toUpperCase();
    }

    if (controlledFeatureRollout) {
        context.controlledFeatureRollout = controlledFeatureRollout;
    }

    return context;
}

export const getOrganizationTier = (entitlements: ApiEntitlement[] = []) => {
    const tierEntitlement = entitlements.find((entitlement) => entitlement.name === "Tier");

    return tierEntitlement?.value;
};

export const getControlledFeatureRollout = (entitlements: ApiEntitlement[] = []) => {
    const controlledFeatureRolloutEntitlement = entitlements.find(
        (entitlement) => entitlement.name === "ControlledFeatureRollout",
    );

    return !!controlledFeatureRolloutEntitlement;
};
