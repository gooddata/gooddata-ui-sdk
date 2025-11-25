// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { DataViewFacade } from "@gooddata/sdk-ui";

export type GeoDataTransformer<TResult> = (
    dataView: DataViewFacade,
    emptyHeaderString: string,
    nullHeaderString: string,
) => TResult;

/**
 * Resolves localized strings and transforms execution data into geo data structures.
 *
 * @internal
 */
export function useGeoDataTransformation<TResult>(
    dataView: DataViewFacade | null,
    transformer: GeoDataTransformer<TResult>,
): TResult | null {
    const intl = useIntl();

    return useMemo(() => {
        if (!dataView) {
            return null;
        }

        const emptyHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });
        const nullHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });

        return transformer(dataView, emptyHeaderString, nullHeaderString);
    }, [dataView, intl, transformer]);
}
