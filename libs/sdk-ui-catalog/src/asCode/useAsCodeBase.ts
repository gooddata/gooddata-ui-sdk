// (C) 2026 GoodData Corporation

import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import type { ICatalogItem } from "../catalogItem/types.js";

import { type IAsCodeDescriptor, type IAsCodeMutationPort, isLoadSeed } from "./descriptor.js";
import { useAsCodeLoadFailure } from "./useAsCodeLoadFailure.js";
import { useMutationPort } from "./useMutationPort.js";

type AsCodeBase = {
    base: unknown;
    isLoading: boolean;
    port: IAsCodeMutationPort;
};

/**
 * Resolves an item's editable definition — async for a `seed.load` type, sync for `seed.editSeed`. A
 * failed fetch toasts the seed's `loadError` and calls `onClose`.
 * @internal
 */
export function useAsCodeBase(
    descriptor: IAsCodeDescriptor,
    item: ICatalogItem | undefined,
    onClose: () => void,
): AsCodeBase {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const fail = useAsCodeLoadFailure(descriptor, onClose);
    const port = useMutationPort(descriptor);
    const seed = descriptor.seed;
    const load = isLoadSeed(seed) ? seed.load : undefined;
    const { result: loaded } = useCancelablePromise<unknown>(
        {
            promise: item && load ? () => load(backend, workspace, item) : undefined,
            onError: fail,
        },
        [item, backend, workspace],
    );

    if (item === undefined) {
        return { base: undefined, isLoading: false, port };
    }
    if (!isLoadSeed(seed)) {
        return { base: seed.editSeed(item), isLoading: false, port };
    }
    return { base: loaded, isLoading: loaded === undefined, port };
}
