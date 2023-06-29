// (C) 2020-2022 GoodData Corporation
import { GdcExecuteAFM, Uri, Identifier, GdcMetadata } from "@gooddata/api-model-bear";
import {
    ObjRef,
    IAttributeFilter,
    filterObjRef,
    isUriRef,
    isNegativeAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    isIdentifierRef,
    areObjRefsEqual,
    objRefToString,
    IMeasure,
    IRelativeDateFilter,
} from "@gooddata/sdk-model";
import { IElementsQueryAttributeFilter, NotSupported } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import flatMap from "lodash/flatMap.js";
import groupBy from "lodash/groupBy.js";
import uniqWith from "lodash/uniqWith.js";

import { toBearRef } from "../../../../convertors/toBackend/ObjRefConverter.js";
import { convertMeasure } from "../../../../convertors/toBackend/afm/MeasureConverter.js";
import { BearAuthenticatedCallGuard } from "../../../../types/auth.js";
import { IUriIdentifierPair } from "@gooddata/api-client-bear";
import { objRefsToUris } from "../../../../utils/api.js";

export class LimitingAfmFactory {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly displayFormRef: ObjRef,
        private readonly workspace: string,
    ) {}

    public getAfm = async (
        filters: IElementsQueryAttributeFilter[] | undefined,
        measures: IMeasure[] | undefined,
        relativeDateFilters: IRelativeDateFilter[] | undefined,
    ): Promise<GdcExecuteAFM.IAfm | undefined> => {
        if (!filters?.length && !measures?.length && !relativeDateFilters?.length) {
            return undefined;
        }

        const filtersPart = filters?.length
            ? [
                  {
                      expression: {
                          value: await this.createFiltersExpressionFromAttributeFilters(filters),
                      },
                  },
              ]
            : undefined;

        const measuresPart = measures?.length ? measures.map(convertMeasure) : undefined;

        const mergedFiltersPart = filtersPart &&
            relativeDateFilters && [...filtersPart, ...relativeDateFilters];

        return {
            attributes: [
                {
                    localIdentifier: "a1",
                    displayForm: toBearRef(this.displayFormRef),
                },
            ],
            filters: mergedFiltersPart || filtersPart || relativeDateFilters,
            measures: measuresPart,
        };
    };

    private createFiltersExpressionFromAttributeFilters = async (
        filters: IElementsQueryAttributeFilter[],
    ) => {
        const filterDisplayForms = filters.map((f) => filterObjRef(f.attributeFilter));
        const allDisplayFormRefs = uniqWith([this.displayFormRef, ...filterDisplayForms], areObjRefsEqual);

        const [identifierUriPairs, displayFormAttributeUriMapping] = await Promise.all([
            this.getIdentifierUriPairs(filters),
            this.getDisplayFormAttributeUriMapping(allDisplayFormRefs),
        ]);

        const getDisplayFormAttributeUri = (ref: ObjRef): Uri => {
            const entry = displayFormAttributeUriMapping.find(([displayFormRef]) =>
                areObjRefsEqual(displayFormRef, ref),
            );
            invariant(entry, `Attribute URI for the display form "${objRefToString(ref)}" was not found`);
            return entry![1];
        };

        const getFilterAttributeUri = (attributeFilter: IAttributeFilter): Uri =>
            getDisplayFormAttributeUri(filterObjRef(attributeFilter));

        const getUriForIdentifier = (objRef: ObjRef): Uri => {
            if (isUriRef(objRef)) {
                return objRef.uri;
            } else {
                const foundUri = identifierUriPairs.find((pair) => pair.identifier === objRef.identifier);
                if (foundUri === undefined) {
                    throw new Error(`URI for identifier ${objRef.identifier} have not been found`);
                }
                return foundUri.uri;
            }
        };

        const attributeRefUri = getDisplayFormAttributeUri(this.displayFormRef);

        const groupsByOverAttribute = groupBy(filters, (filter) => getUriForIdentifier(filter.overAttribute));

        const expressionsByOverAttribute = Object.keys(groupsByOverAttribute).map((overAttribute) => {
            const filterGroupExpression = groupsByOverAttribute[overAttribute]
                .map((parentFilter) => {
                    const isNegativeFilter = isNegativeAttributeFilter(parentFilter.attributeFilter);
                    const filterElements = filterAttributeElements(parentFilter.attributeFilter);
                    const parentFilterAttributeUri = getFilterAttributeUri(parentFilter.attributeFilter);

                    if (!isAttributeElementsByRef(filterElements)) {
                        throw new NotSupported(
                            "Only attribute elements by ref are supported in elements attribute filter on the bear backend",
                        );
                    }
                    const elementsString = filterElements.uris
                        .map((attributeElementUri) => `[${attributeElementUri}]`)
                        .join(", ");
                    const operatorString = isNegativeFilter ? "NOT IN" : "IN";
                    return `[${parentFilterAttributeUri}] ${operatorString} (${elementsString})`;
                })
                .join(" AND ");

            return `((${filterGroupExpression}) OVER [${overAttribute}] TO [${attributeRefUri}])`;
        });

        return expressionsByOverAttribute.join(" AND ");
    };

    private getIdentifierUriPairs = (
        filters: IElementsQueryAttributeFilter[],
    ): Promise<IUriIdentifierPair[]> => {
        const allIdentifiersUsed = this.getAllIdentifiersUsedInAttributeFilters(filters);
        return this.authCall((sdk) => sdk.md.getUrisFromIdentifiers(this.workspace, allIdentifiersUsed));
    };

    private getAllIdentifiersUsedInAttributeFilters = (
        filters: IElementsQueryAttributeFilter[],
    ): Identifier[] => {
        return flatMap(filters, (filter) => {
            // the only candidates are the filter itself and the overAttribute
            return [filter.overAttribute, filterObjRef(filter.attributeFilter)]
                .filter(isIdentifierRef)
                .map((ref) => ref.identifier);
        });
    };

    private getDisplayFormAttributeUriMapping = async (displayForms: ObjRef[]): Promise<[ObjRef, Uri][]> => {
        const displayFormUris = await objRefsToUris(displayForms, this.workspace, this.authCall);
        return this.authCall(async (sdk) => {
            const response = await sdk.md.getObjects<GdcMetadata.IWrappedAttributeDisplayForm>(
                this.workspace,
                displayFormUris,
            );

            return displayForms.map((displayForm) => {
                const attribute = response.find((item) => {
                    if (isIdentifierRef(displayForm)) {
                        return displayForm.identifier === item.attributeDisplayForm.meta.identifier;
                    } else {
                        return displayForm.uri === item.attributeDisplayForm.meta.uri;
                    }
                });
                if (attribute === undefined) {
                    throw new Error("Cannot find attribute for display form");
                }
                return [displayForm, attribute.attributeDisplayForm.content.formOf];
            });
        });
    };
}
