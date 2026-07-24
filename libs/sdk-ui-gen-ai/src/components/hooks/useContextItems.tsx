// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IGenAIUserContext } from "@gooddata/sdk-model";
import { type IUiMenuItem, UiIcon } from "@gooddata/sdk-ui-kit";

import {
    collectAvailableReferences,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import { type IGenAIContextObject } from "../../types.js";
import { getIconByType } from "../utils/icons.js";

export function useContextItems(
    ambient: IGenAIUserContext | undefined,
    active: IGenAIUserContext | undefined,
): IUiMenuItem<{ interactive: IGenAIContextObject }>[] {
    const intl = useIntl();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });

    return useMemo(() => {
        const items: IUiMenuItem<{ interactive: IGenAIContextObject }>[] = [];

        const currentReferences = collectAvailableReferences(ambient, emptyReferenceLabel);
        const selectedReferences = collectContextReferences(active, emptyReferenceLabel);

        currentReferences.forEach((reference) => {
            const isSelected = selectedReferences.some(
                (selectedReference) =>
                    selectedReference.id === reference.id && selectedReference.type === reference.type,
            );

            if (!isSelected) {
                const icon = getIconByType(reference.type);

                items.push({
                    type: "interactive",
                    id: reference.id,
                    data: reference,
                    stringTitle: reference.title,
                    ...(icon.iconBefore
                        ? {
                              iconLeft: <UiIcon size={16} type={icon.iconBefore} color={icon.iconColor} />,
                          }
                        : {}),
                });
            }
        });

        return items;
    }, [active, ambient, emptyReferenceLabel]);
}
