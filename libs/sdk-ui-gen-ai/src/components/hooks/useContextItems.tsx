// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IGenAIUserContext } from "@gooddata/sdk-model";
import { type IUiMenuItem, UiIcon } from "@gooddata/sdk-ui-kit";

import {
    type IGenAIContextObject,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import { getIconByType } from "../utils/icons.js";

export function useContextItems(
    current: IGenAIUserContext | undefined,
    selected: IGenAIUserContext | undefined,
    type: "ambient" | "user",
): IUiMenuItem<{ interactive: IGenAIContextObject }>[] {
    return useMemo(() => {
        const items: IUiMenuItem<{ interactive: IGenAIContextObject }>[] = [];

        const currentReferences = collectContextReferences(current, type);
        const selectedReferences = collectContextReferences(selected, type);

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
                              iconLeft: <UiIcon type={icon.iconBefore} color={icon.iconColor} />,
                          }
                        : {}),
                });
            }
        });

        return items;
    }, [current, selected, type]);
}
