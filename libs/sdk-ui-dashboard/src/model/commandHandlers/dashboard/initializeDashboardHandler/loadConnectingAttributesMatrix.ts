// (C) 2022 GoodData Corporation
import { all, call } from "redux-saga/effects";
import compact from "lodash/compact";
import flatMap from "lodash/flatMap";
import uniqWith from "lodash/uniqWith";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ICatalogAttribute, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";

import { PromiseReturnType } from "../../../types/sagas";
import { ConnectingAttributeMatrix } from "../../../types/attributeFilterTypes";

/**
 * Creates a matrix of connecting attribute refs for every possible combination of attribute filters.
 *
 * These connecting attributes serve to connect two attribute filters within the parent-child relationship.
 */
export function* loadConnectingAttributesMatrix(
    backend: IAnalyticalBackend,
    workspace: string,
    filters: IDashboardAttributeFilter[],
    catalogAttributes: ICatalogAttribute[],
) {
    /**
     * Load attributes for the display forms used within the filter context.
     */
    const attributes = compact(
        filters.map(
            (filter) =>
                catalogAttributes.find((catalogAttribute) =>
                    catalogAttribute.displayForms.some((df) =>
                        areObjRefsEqual(df, filter.attributeFilter.displayForm),
                    ),
                )?.attribute.ref,
        ),
    );

    /**
     * Pair all possible combination of the attributes to check for connecting attributes.
     */
    const attributePairs = attributes.map((attribute, index) => {
        const pairs = [];
        for (
            let neighborFilterIndex = index + 1;
            neighborFilterIndex < attributes.length;
            neighborFilterIndex++
        ) {
            pairs.push([attribute, attributes[neighborFilterIndex]]);
        }

        return pairs;
    });

    if (!attributePairs.length) {
        return [];
    }

    /**
     * Load connecting attributes refs for all attribute pairs.
     */
    const connectingAttributeRefs: PromiseReturnType<ReturnType<typeof getConnectingAttributes>>[] =
        yield all(
            flatMap(attributePairs).map((pair) => call(getConnectingAttributes, backend, workspace, pair)),
        );

    /**
     * Load metadata for all connecting attributes.
     */
    const connectingAttributeMeta: PromiseReturnType<ReturnType<typeof getConnectingAttributesMeta>>[] =
        yield all(
            uniqWith(flatMap(connectingAttributeRefs), areObjRefsEqual).map((attribute) =>
                call(getConnectingAttributesMeta, backend, workspace, attribute),
            ),
        );

    const connectingAttributeMatrix: ConnectingAttributeMatrix = [];
    let connectingAttributeIndex = 0;

    /**
     * Creates the connecting attributes matrix.
     */
    for (let row = 0; row < filters.length; row++) {
        connectingAttributeMatrix[row] = connectingAttributeMatrix[row] ? connectingAttributeMatrix[row] : [];

        for (let column = row + 1; column < filters.length; column++) {
            connectingAttributeMatrix[column] = connectingAttributeMatrix[column]
                ? connectingAttributeMatrix[column]
                : [];
            const connectingAttributes = connectingAttributeRefs[connectingAttributeIndex++]?.map((ref) =>
                connectingAttributeMeta.find((meta) => areObjRefsEqual(meta.ref, ref)),
            );

            /**
             * Push fetched data to square matrix.
             */
            connectingAttributeMatrix[row][column] = compact(connectingAttributes);
            connectingAttributeMatrix[column][row] = compact(connectingAttributes);
        }
    }

    return connectingAttributeMatrix;
}

function getConnectingAttributesMeta(backend: IAnalyticalBackend, workspace: string, ref: ObjRef) {
    return backend.workspace(workspace).attributes().getAttribute(ref);
}

function getConnectingAttributes(
    backend: IAnalyticalBackend,
    workspace: string,
    refs: ObjRef[],
): Promise<ObjRef[]> {
    return backend.workspace(workspace).attributes().getCommonAttributes(refs);
}
