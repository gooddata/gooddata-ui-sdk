// (C) 2020-2022 GoodData Corporation
import { IStaticFeatures } from "@gooddata/api-client-tiger";
import { ITigerFeatureFlags } from "../uiFeatures.js";
import { FeatureDef, FeaturesMap, mapFeatures } from "./feature.js";

export async function getStaticFeatures(
    features: IStaticFeatures["static"],
): Promise<Partial<ITigerFeatureFlags>> {
    const { items } = features;

    return mapFeatures(remapStaticFeatures(items));
}

function remapStaticFeatures(features: IStaticFeatures["static"]["items"]): FeaturesMap {
    return Object.keys(features).reduce((prev, key) => {
        const value = features[key as keyof IStaticFeatures["static"]];

        prev[key] = {
            id: key,
            l: false,
            key,
            strategies: [],
            type: "STRING",
            value,
            version: "1",
        } as FeatureDef;
        return prev;
    }, {} as FeaturesMap);
}
