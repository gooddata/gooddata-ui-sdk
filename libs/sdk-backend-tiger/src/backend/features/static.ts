// (C) 2020-2025 GoodData Corporation

import { IStaticFeatures } from "@gooddata/api-client-tiger";

import { FeatureDef, FeaturesMap, mapFeatures } from "./feature.js";
import { ITigerFeatureFlags } from "../uiFeatures.js";

export async function getStaticFeatures({
    items,
}: IStaticFeatures["static"]): Promise<Partial<ITigerFeatureFlags>> {
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
