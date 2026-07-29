// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { type IAsCodeDescriptor, loadErrorOf } from "./descriptor.js";

/**
 * Identity-stable across the unstable toast and close identities, so an effect depending on it does
 * not re-fire.
 * @internal
 */
export function useAsCodeLoadFailure(descriptor: IAsCodeDescriptor, onClose: () => void): () => void {
    const { addError } = useToastMessage();
    const latest = useAutoupdateRef({ addError, onClose, loadError: loadErrorOf(descriptor) });
    return useCallback(() => {
        const { addError, onClose, loadError } = latest.current;
        if (loadError) {
            addError(loadError);
        }
        onClose();
    }, [latest]);
}
