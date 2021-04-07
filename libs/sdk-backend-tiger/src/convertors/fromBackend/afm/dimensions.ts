// (C) 2019-2021 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IMeasureDescriptor,
    IDimensionDescriptor,
    ITotalDescriptor,
} from "@gooddata/sdk-backend-spi";
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
} from "@gooddata/sdk-model";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import groupBy from "lodash/groupBy";

const DEFAULT_FORMAT = "#,#.##";

type AttrTotals = Record<Identifier, ITotalDescriptor[]>;

function transformDimension(
    dim: ResultDimension,
    simpleMeasureRefs: Record<string, ObjRef>,
    attrTotals: AttrTotals,
): IDimensionDescriptor {
    return {
        headers: dim.headers.map((header, headerIdx) => {
            const h = header;

            if (isAttributeHeader(h)) {
                /*
                 * Funny stuff #1: we have to set 'uri' to some made-up value resembling the URIs sent by bear. This
                 *  is because pivot table relies on the format of URIs. Ideally we would refactor pivot table to
                 *  not care about this however this aspect is like a couple of eggs that hold the pivot spaghetti
                 *  together - cannot be easily untangled.
                 */
                const attrDescriptor: IAttributeDescriptor = {
                    attributeHeader: {
                        uri: `/obj/${headerIdx}`,
                        identifier: h.attributeHeader.label.id,
                        ref: idRef(h.attributeHeader.label.id, "displayForm"),
                        formOf: {
                            identifier: h.attributeHeader.attribute.id,
                            name: h.attributeHeader.attributeName,
                            uri: `/obj/${headerIdx}`,
                            ref: idRef(h.attributeHeader.attribute.id, "attribute"),
                        },
                        localIdentifier: h.attributeHeader.localIdentifier,
                        name: h.attributeHeader.labelName,
                        totalItems: attrTotals[h.attributeHeader.localIdentifier] ?? [],
                    },
                };

                return attrDescriptor;
            } else {
                /*
                 * Funny stuff #2: tiger does not send name & format according to the contract (which is inspired
                 *  by bear behavior). The code must reconciliate as follows:
                 *
                 *  -  if name does not come from tiger, then default the name to localIdentifier
                 *  -  if format does not come from tiger, then default to a hardcoded format
                 *
                 * Funny stuff #3: tiger does not send simple measure identifier. The code must reconciliate:
                 *
                 * -   look up simple measure by local id from execution definition
                 */
                const measureDescriptor: IMeasureGroupDescriptor = {
                    measureGroupHeader: {
                        items: h.measureGroupHeader.measureGroupHeaderItems.map((m) => {
                            const ref = simpleMeasureRefs[m.localIdentifier];
                            const identifier = isIdentifierRef(ref) ? ref.identifier : undefined;
                            const uri = ref ? `/obj/${headerIdx}` : undefined;

                            const newItem: IMeasureDescriptor = {
                                measureHeaderItem: {
                                    localIdentifier: m.localIdentifier,
                                    name: m.name ?? m.localIdentifier,
                                    format: m.format ?? DEFAULT_FORMAT,
                                    identifier,
                                    ref,
                                    uri,
                                },
                            };

                            return newItem;
                        }),
                    },
                };

                return measureDescriptor;
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
            totals.map((total) => ({ totalHeaderItem: { name: total.type } })),
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
