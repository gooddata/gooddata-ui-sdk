// (C) 2021 GoodData Corporation
/**
 * @internal
 */
export interface IDataLoaderFactory<TLoader> {
    forWorkspace(workspace: string): TLoader;
    reset: () => void;
}
