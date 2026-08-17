// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IGenAIUserContext } from "@gooddata/sdk-model";

import {
    collectAvailableReferences,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import { type IGenAIContextObject } from "../../types.js";

export function useContextItems(
    ambient: IGenAIUserContext | undefined,
    active: IGenAIUserContext | undefined,
): IGenAIContextObject[] {
    const intl = useIntl();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });

    return useMemo(() => {
        const currentReferences = collectAvailableReferences(ambient, emptyReferenceLabel);
        const selectedReferences = collectContextReferences(active, emptyReferenceLabel);

        return currentReferences.filter(
            (reference) =>
                !selectedReferences.some(
                    (selectedReference) =>
                        selectedReference.id === reference.id && selectedReference.type === reference.type,
                ),
        );
    }, [active, ambient, emptyReferenceLabel]);
}
