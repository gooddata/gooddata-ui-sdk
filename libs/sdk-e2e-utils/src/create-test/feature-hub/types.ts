// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export type FeatureHubFeatureValue = boolean | string | number;

/**
 * @internal
 */
export interface IFeatureHubFeature {
    id: string;
    key: string;
    l: boolean;
    version?: number;
    type: string;
    value?: FeatureHubFeatureValue;
    strategies?: unknown[];
    v?: string;
}

export interface IFeatureHubEnvironment {
    id: string;
    features: IFeatureHubFeature[];
}
