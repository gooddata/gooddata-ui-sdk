// (C) 2026 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";

import type { ICatalogItem } from "../catalogItem/types.js";

import { useAsCodePort } from "./AsCodeMutationContext.js";
import type { IAsCodeDefinition, IAsCodeDescriptor, IAsCodeMutationPort } from "./descriptor.js";

type AsCodeBase = {
    /** The editable definition for the item, or `undefined` while loading / when no item was given. */
    base: IAsCodeDefinition | undefined;
    isLoading: boolean;
    port: IAsCodeMutationPort;
};

/**
 * Resolves an existing item's editable definition for the edit dialog and for the create dialog when
 * duplicating. A fetching type (metric, `port.load`) resolves asynchronously; a mapping type
 * (parameter, `editSeed`) resolves synchronously, so it never flashes a loading state. `onError` fires
 * on a failed fetch; an `undefined` item (a blank create) resolves to nothing.
 * @internal
 */
export function useAsCodeBase(
    descriptor: IAsCodeDescriptor,
    item: ICatalogItem | undefined,
    onError: () => void,
): AsCodeBase {
    const port = useAsCodePort(descriptor.objectType);
    const load = port.load;
    const { result: loaded } = useCancelablePromise<IAsCodeDefinition>(
        { promise: item && load ? () => load(item) : undefined, onError },
        [item, port],
    );

    if (item === undefined) {
        return { base: undefined, isLoading: false, port };
    }
    if (load) {
        return { base: loaded, isLoading: loaded === undefined, port };
    }
    if (!descriptor.editSeed) {
        // A descriptor must provide exactly one of `port.load` / `editSeed`; without either there is
        // no way to seed the editor. Fail loudly rather than open a silently-blank editor.
        throw new Error(
            `As-code descriptor "${descriptor.objectType}" provides neither port.load nor editSeed.`,
        );
    }
    return { base: descriptor.editSeed(item), isLoading: false, port };
}
