// (C) 2019-2020 GoodData Corporation
import {
    IElementQueryFactory,
    IElementQuery,
    IElementQueryOptions,
    IElementQueryResult,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    isUriRef,
    ObjRef,
    filterAttributeElements,
    filterObjRef,
    isIdentifierRef,
    Uri,
    Identifier,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { objRefToUri, getObjectIdFromUri } from "../../../utils/api";
import { IElementQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { GdcExecuteAFM } from "@gooddata/api-model-bear";

export class BearWorkspaceElements implements IElementQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementQuery {
        return new BearWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }
}

class BearWorkspaceElementsQuery implements IElementQuery {
    private limit: number | undefined;
    private offset: number | undefined;
    private options: IElementQueryOptions | undefined;
    private attributeRef: ObjRef | undefined;
    private attributeFilters: IElementQueryAttributeFilter[] | undefined;

    // cached value of objectId corresponding to identifier
    private objectId: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly displayFormRef: ObjRef,
        private readonly workspace: string,
    ) {}

    public withLimit(limit: number): IElementQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementQuery {
        this.offset = offset;
        return this;
    }

    public withAttributeFilters(
        attributeRef: ObjRef,
        filters: IElementQueryAttributeFilter[],
    ): IElementQuery {
        this.attributeRef = attributeRef;
        this.attributeFilters = filters;
        return this;
    }

    public withOptions(options: IElementQueryOptions): IElementQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.options);
    }

    private async getObjectId(): Promise<string> {
        if (!this.objectId) {
            const uri = await objRefToUri(this.displayFormRef, this.workspace, this.authCall);
            this.objectId = getObjectIdFromUri(uri);
        }

        return this.objectId;
    }

    private async queryWorker(
        offset: number | undefined = 0,
        limit: number | undefined,
        options: IElementQueryOptions | undefined,
    ): Promise<IElementQueryResult> {
        let filtersAfm;
        if (this.attributeRef && this.attributeFilters && this.attributeFilters.length !== 0) {
            filtersAfm = await this.createAfmForAttributeFilters(this.attributeRef, this.attributeFilters);
        }
        const mergedOptions = { ...options, limit, offset, afm: filtersAfm };
        const objectId = await this.getObjectId();
        const data = await this.authCall((sdk) =>
            sdk.md.getValidElements(this.workspace, objectId, mergedOptions),
        );

        const { items, paging } = data.validElements;
        const total = Number.parseInt(paging.total, 10);
        const serverOffset = Number.parseInt(paging.offset, 10);
        const { count } = paging;

        const hasNextPage = serverOffset + count < total;

        const emptyResult: IElementQueryResult = {
            items: [],
            limit: count,
            offset: total,
            totalCount: total,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            items: items.map((element: { element: IAttributeElement }) => element.element),
            limit: count,
            offset: serverOffset,
            totalCount: total,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
        };
    }

    private async createAfmForAttributeFilters(
        attributeRef: ObjRef,
        attributeFilters: IElementQueryAttributeFilter[],
    ): Promise<GdcExecuteAFM.IAfm> {
        const displayFormUri = await objRefToUri(this.displayFormRef, this.workspace, this.authCall);
        return {
            attributes: [{ localIdentifier: "a1", displayForm: { uri: displayFormUri } }],
            filters: [
                {
                    expression: {
                        value: await this.createFiltersExpressionFromAttributeFilters(
                            attributeRef,
                            attributeFilters,
                        ),
                    },
                },
            ],
        };
    }

    private async createFiltersExpressionFromAttributeFilters(
        attributeRef: ObjRef,
        attributeFilters: IElementQueryAttributeFilter[],
    ) {
        interface IFiltersGroupedByUri {
            [overAttributeUri: string]: IElementQueryAttributeFilter[];
        }

        const identifiersToUriPairs = await this.authCall((sdk) =>
            sdk.md.getUrisFromIdentifiers(
                this.workspace,
                this.getAllIdentifiersUsedInAttributeFilters(attributeFilters),
            ),
        );

        const getUriForIdentifier = (objRef: ObjRef): Uri => {
            if (isUriRef(objRef)) {
                return objRef.uri;
            } else {
                const foundUri = identifiersToUriPairs.find((pair) => pair.identifier === objRef.identifier);
                if (foundUri === undefined) {
                    throw new Error(`URI for identifier ${objRef.identifier} have not been found`);
                }
                return foundUri.uri;
            }
        };

        const groupsByOverAttribute = attributeFilters.reduce<IFiltersGroupedByUri>((groups, filter) => {
            const overAttributeUri = getUriForIdentifier(filter.overAttribute);
            groups[overAttributeUri] = groups[overAttributeUri]
                ? groups[overAttributeUri].concat(filter)
                : [filter];
            return groups;
        }, {});

        const attributeRefUri = await objRefToUri(attributeRef, this.workspace, this.authCall);

        const expressionsByOverAttribute = Object.keys(groupsByOverAttribute).map((overAttribute) => {
            const filterGroupExpression = groupsByOverAttribute[overAttribute]
                .map((parentFilter) => {
                    const isNegativeFilter = isNegativeAttributeFilter(parentFilter.attributeFilter);
                    const filterElements = filterAttributeElements(parentFilter.attributeFilter);
                    const filterDisplayForm = filterObjRef(parentFilter.attributeFilter);

                    if (!isAttributeElementsByRef(filterElements)) {
                        throw new NotSupported(
                            "Only attribute elements by ref are supported in elements attribute filter",
                        );
                    }
                    const parentFilterFisplayFormUri = getUriForIdentifier(filterDisplayForm);
                    const elementsString = filterElements.uris
                        .map((attributeElementUri) => `[${attributeElementUri}]`)
                        .join(", ");
                    const operatorString = isNegativeFilter ? "NOT IN" : "IN";
                    return `[${parentFilterFisplayFormUri}] ${operatorString} (${elementsString})`;
                })
                .join(" AND ");

            return `((${filterGroupExpression}) OVER [${overAttribute}] TO [${attributeRefUri}])`;
        });

        return expressionsByOverAttribute.join(" AND ");
    }

    private getAllIdentifiersUsedInAttributeFilters(attributeFilters: IElementQueryAttributeFilter[]) {
        return attributeFilters.reduce<Identifier[]>((acc, filter) => {
            if (isIdentifierRef(filter.overAttribute)) {
                acc.push(filter.overAttribute.identifier);
            }
            const parentFilterObjRef = filterObjRef(filter.attributeFilter);
            if (isIdentifierRef(parentFilterObjRef)) {
                acc.push(parentFilterObjRef.identifier);
            }
            return acc;
        }, []);
    }
}
