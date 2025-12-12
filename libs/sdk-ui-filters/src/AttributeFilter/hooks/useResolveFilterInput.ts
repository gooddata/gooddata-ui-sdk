// (C) 2021-2025 GoodData Corporation
import { useCallback } from "react";

import { type IAttributeFilter } from "@gooddata/sdk-model";
import { type IPlaceholder, usePlaceholder } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const useResolveFilterInput = (
    filter?: IAttributeFilter,
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>,
) => {
    const [resolvedPlaceholder, setPlaceholderValue] = usePlaceholder(connectToPlaceholder);

    const currentFilter = resolvedPlaceholder ?? filter;

    const setConnectedPlaceholderValue = useCallback(
        (filter: IAttributeFilter) => {
            if (connectToPlaceholder) {
                setPlaceholderValue(filter);
            }
        },
        [connectToPlaceholder, setPlaceholderValue],
    );

    return {
        filter: currentFilter,
        setConnectedPlaceholderValue,
    };
};
