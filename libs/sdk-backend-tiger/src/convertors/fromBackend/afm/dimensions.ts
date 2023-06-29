// (C) 2019-2022 GoodData Corporation
import { isAttributeHeader, ResultDimension } from "@gooddata/api-client-tiger";

import {
    Identifier,
    idRef,
    IExecutionDefinition,
    isIdentifierRef,
    isSimpleMeasure,
    measureItem,
    measureLocalId,
    ObjRef,
    IDimensionItemDescriptor,
    IDimensionDescriptor,
    ITotalDescriptor,
} from "@gooddata/sdk-model";
import keyBy from "lodash/keyBy.js";
import mapValues from "lodash/mapValues.js";
import groupBy from "lodash/groupBy.js";
import uniqBy from "lodash/uniqBy.js";

const DEFAULT_FORMAT = "#,#.##";

type AttrTotals = Record<Identifier, ITotalDescriptor[]>;

function transformDimension(
    dim: ResultDimension,
    simpleMeasureRefs: Record<string, ObjRef>,
    attrTotals: AttrTotals,
): IDimensionDescriptor {
    return {
        headers: dim.headers.map((header): IDimensionItemDescriptor => {
            const h = header;

            if (isAttributeHeader(h)) {
                return {
                    attributeHeader: {
                        // TODO: TIGER-HACK: Tiger provides no uri
                        uri: "",
                        identifier: h.attributeHeader.label.id,
                        ref: idRef(h.attributeHeader.label.id, "displayForm"),
                        formOf: {
                            identifier: h.attributeHeader.attribute.id,
                            name: h.attributeHeader.attributeName,
                            // TODO: TIGER-HACK: Tiger provides no uri
                            uri: "",
                            ref: idRef(h.attributeHeader.attribute.id, "attribute"),
                        },
                        localIdentifier: h.attributeHeader.localIdentifier,
                        name: h.attributeHeader.labelName,
                        totalItems: attrTotals[h.attributeHeader.localIdentifier] ?? [],
                        granularity: h.attributeHeader.granularity,
                        format: h.attributeHeader.format,
                    },
                };
            } else {
                /*
                 * Funny stuff #1: tiger does not send name & format according to the contract (which is inspired
                 *  by bear behavior). The code must reconciliate as follows:
                 *
                 *  -  if name does not come from tiger, then default the name to localIdentifier
                 *  -  if format does not come from tiger, then default to a hardcoded format
                 *
                 * Funny stuff #2: tiger does not send simple measure identifier. The code must reconciliate:
                 *
                 * -   look up simple measure by local id from execution definition
                 */
                return {
                    measureGroupHeader: {
                        items:
                            h.measureGroupHeaders?.map((m) => {
                                const ref = simpleMeasureRefs[m.localIdentifier];
                                const identifier = isIdentifierRef(ref) ? ref.identifier : undefined;

                                return {
                                    measureHeaderItem: {
                                        localIdentifier: m.localIdentifier,
                                        name: m.name ?? m.localIdentifier,
                                        format: m.format ?? DEFAULT_FORMAT,
                                        identifier,
                                        ref,
                                    },
                                };
                            }) || [],
                    },
                };
            }
        }),
    };
}

/**
 * Compute mapping from attribute identifiers to all ITotalDescriptors corresponding to that attribute.
 */
function getAttrTotals(def: IExecutionDefinition): AttrTotals {
    const attrTotals: AttrTotals[] = def.dimensions.map((dim) => {
        const totalsByAttrId = groupBy(dim.totals ?? [], (total) => total.attributeIdentifier);
        return mapValues(totalsByAttrId, (totals) =>
            uniqBy(totals, (total) => total.type).map((total) => ({ totalHeaderItem: { name: total.type } })),
        );
    });
    return Object.assign({}, ...attrTotals);
}

/**
 * Transforms dimensions in the result provided by backend to the unified model used in SDK. The tiger backend
 * does not return all the data needed by the SPI. For some information, the transformation needs to look into
 * the input execution definition.
 *
 * @param dimensions - dimensions from execution result
 * @param def - execution definition, this is needed to augment the descriptors with data required by the SPI which
 *  the tiger backend does not pass
 *
 * @returns dimensions as used in the unified model
 */
export function transformResultDimensions(
    dimensions: ResultDimension[],
    def: IExecutionDefinition,
): IDimensionDescriptor[] {
    const simpleMeasures = def.measures.filter(isSimpleMeasure);
    const measureRefs: Record<string, ObjRef> = mapValues(keyBy(simpleMeasures, measureLocalId), (m) =>
        measureItem(m),
    );

    return dimensions.map((dim) => transformDimension(dim, measureRefs, getAttrTotals(def)));
}
