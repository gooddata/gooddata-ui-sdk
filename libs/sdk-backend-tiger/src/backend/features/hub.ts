// (C) 2020-2025 GoodData Corporation

import axios, { AxiosResponse } from "axios";

import { FeatureContext, ILiveFeatures } from "@gooddata/api-client-tiger";

import { FeatureDef, FeaturesMap, mapFeatures } from "./feature.js";
import { DefaultFeatureFlags, ITigerFeatureFlags } from "../uiFeatures.js";

type HubServiceState = Record<
    string,
    {
        etag: string;
        data: FeatureHubResponse;
    }
>;

const state: HubServiceState = {};
const FH_TIMEOUT = 30000; //wait max 30s to FeatureHub

export async function getFeatureHubFeatures(
    features: ILiveFeatures["live"],
    wsContext: Partial<FeatureContext> = {},
): Promise<Partial<ITigerFeatureFlags>> {
    const { configuration, context } = features;
    try {
        const data = await loadHubFeatures(configuration, { ...context, ...wsContext }, state);
        const featuresMap = data.reduce((prev, item) => ({ ...prev, [item.key]: item }), {} as FeaturesMap);
        return mapFeatures(featuresMap);
    } catch (err) {
        console.error("Loading features from FeatureHub was not successful. Err: " + err);
    }

    return DefaultFeatureFlags;
}

//NOTE: Use FeatureHub SDK after we upgrade version of typescript
// - more info in ticket RAIL-4279
async function loadHubFeatures(
    configuration: ILiveFeatures["live"]["configuration"],
    context: FeatureContext,
    state: HubServiceState,
): Promise<FeatureHubResponse[number]["features"]> {
    const { host, key } = configuration;

    return new Promise((resolve, reject) => {
        function callFailed() {
            delete state[key];
            reject(new Error(`FeatureHub is not ready, is not available or api key is wrong.`));
        }

        const promise = getFeatureHubData(host, key, context, state[key]);
        promise.then(({ data, headers, status }) => {
            if (status === 304) {
                loadFeatures(state[key].data, resolve, callFailed);
                return;
            }

            state[key] = {
                etag: headers["etag"],
                data: data || [],
            };
            loadFeatures(data, resolve, callFailed);
        });
        promise.catch(callFailed);
    });
}

function loadFeatures(
    data: FeatureHubResponse,
    resolveFn: (features: FeatureHubResponse[number]["features"]) => void,
    errFn: () => void,
) {
    const record = data[data.length - 1];
    if (record) {
        resolveFn(record.features);
        return;
    }
    errFn();
}

//NOTE: Types from https://docs.featurehub.io/featurehub/latest/sdks-development.html
export type FeatureHubResponse = {
    id: string;
    features: FeatureDef[];
}[];

async function getFeatureHubData(
    host: string,
    key: string,
    context: FeatureContext,
    state?: HubServiceState[string],
): Promise<AxiosResponse<FeatureHubResponse>> {
    const featureHubFlags: string[] = [];
    if (context.organizationId) {
        featureHubFlags.push(`organizationId=${encodeURIComponent(context.organizationId)}`);
    }
    if (context.earlyAccessValues?.length > 0) {
        featureHubFlags.push(
            `earlyAccess=${context.earlyAccessValues
                .filter(Boolean)
                .map((v) => encodeURIComponent(v))
                .join(";")}`,
        );
    }
    if (context.tier) {
        featureHubFlags.push(`tier=${encodeURIComponent(context.tier)}`);
    }

    if (context.jsSdkVersion) {
        featureHubFlags.push(`jsSdkVersion=${encodeURIComponent(context.jsSdkVersion)}`);
    }

    if (context.controlledFeatureRollout) {
        featureHubFlags.push(
            `ControlledFeatureRollout=${encodeURIComponent(context.controlledFeatureRollout)}`,
        );
    }

    return axios.get("/features", {
        method: "GET",
        baseURL: host,
        params: {
            sdkUrl: key,
        },
        timeout: FH_TIMEOUT,
        headers: {
            "Content-type": "application/json",
            "X-FeatureHub": featureHubFlags.join(","),
            ...(state ? { "if-none-match": state.etag } : {}),
        },
        validateStatus: (status) => {
            return (status >= 200 && status < 300) || status === 304;
        },
    });
}
