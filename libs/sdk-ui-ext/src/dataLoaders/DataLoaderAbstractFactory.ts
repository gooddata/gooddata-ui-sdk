// (C) 2021 GoodData Corporation
import LRUCache from "lru-cache";
import { LOADER_CACHE_SIZE } from "./constants";
import { IDataLoaderFactory } from "./types";

export const dataLoaderAbstractFactory = <TLoader>(
    createLoader: (workspace: string) => TLoader,
): IDataLoaderFactory<TLoader> => {
    const loaders = new LRUCache<string, TLoader>({ max: LOADER_CACHE_SIZE });

    return {
        forWorkspace(workspace) {
            let loader = loaders.get(workspace);

            if (!loader) {
                loader = createLoader(workspace);
                loaders.set(workspace, loader);
            }

            return loader;
        },
        reset() {
            loaders.reset();
        },
    };
};
