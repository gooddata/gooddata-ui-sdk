// (C) 2020-2026 GoodData Corporation

import { type IStaticFeatures } from "@gooddata/api-client-tiger";

import { type FeatureDef, type FeaturesMap, mapFeatures } from "./feature.js";
import { type ITigerFeatureFlags } from "../uiFeatures.js";

export function getStaticFeatures({ items }: IStaticFeatures["static"]): Partial<ITigerFeatureFlags> {
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
