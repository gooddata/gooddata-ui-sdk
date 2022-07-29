// (C) 2021-2022 GoodData Corporation
import { useCallback, useMemo } from "react";
import { IAttributeFilter, idRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { IPlaceholder, usePlaceholder } from "@gooddata/sdk-ui";
import invariant from "ts-invariant";
import { OnApplyCallbackType } from "../Components/types";

export const useFilterPlaceholderResolver = (
    filter?: IAttributeFilter,
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>,
    identifier?: string,
    onApply?: OnApplyCallbackType,
) => {
    invariant(
        !(filter && connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    invariant(
        !(filter && !onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    //deprecated identifier check

    invariant(
        !(filter && identifier),
        "It's not possible to combine 'identifier' property with 'filter' property. Either provide a value, or a filter.",
    );

    invariant(
        !(identifier && !onApply),
        "It's not possible to use 'identifier' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    invariant(
        !(identifier && connectToPlaceholder),
        "It's not possible to combine 'identifier' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    if (identifier) {
        // eslint-disable-next-line no-console
        console.warn(
            "Definition of an attribute display form using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
        );
    }

    const [resolvedPlaceholder, setPlaceholderValue] = usePlaceholder(connectToPlaceholder);

    const currentFilter = useMemo(() => {
        return resolvedPlaceholder || filter || createFilterFormIdentifier(identifier);
    }, [resolvedPlaceholder, filter, identifier]);

    const onFilterPlaceholderApply = useCallback(
        (filter: IAttributeFilter) => {
            if (connectToPlaceholder) {
                setPlaceholderValue(filter);
            }
        },
        [connectToPlaceholder, setPlaceholderValue],
    );

    return {
        filter: currentFilter,
        onFilterPlaceholderApply,
    };
};

const createFilterFormIdentifier = (identifier: string) => {
    return newNegativeAttributeFilter(idRef(identifier), {
        uris: [],
    });
};
