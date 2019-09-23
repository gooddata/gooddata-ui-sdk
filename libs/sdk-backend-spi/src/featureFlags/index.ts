// (C) 2019 GoodData Corporation

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IFeatureFlagsQuery {
    query(): Promise<IFeatureFlags>;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IFeatureFlags {
    [key: string]: number | boolean | string;
}
