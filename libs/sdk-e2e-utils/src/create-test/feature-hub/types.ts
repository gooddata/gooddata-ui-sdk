// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export interface IFeatureHubFeature {
    id: string;
    key: string;
    l: boolean;
    version?: number;
    type: string;
    value?: boolean | string | number;
    strategies?: unknown[];
    v?: string;
}

/**
 * @internal
 */
export interface IFeatureHubEnvironment {
    id: string;
    features: IFeatureHubFeature[];
}
