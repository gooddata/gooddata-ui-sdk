// (C) 2019-2020 GoodData Corporation
import {
    IElementQueryFactory,
    IElementQuery,
    IElementQueryOptions,
    IElementQueryResult,
    UnexpectedError,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, isIdentifierRef, IAttributeElement } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerWorkspaceElements implements IElementQueryFactory {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementQuery {
        return new TigerWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }
}

class TigerWorkspaceElementsQuery implements IElementQuery {
    private limit: number = 100;
    private offset: number = 0;
    private options: IElementQueryOptions | undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly ref: ObjRef,
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

    public withAttributeFilters(): IElementQuery {
        throw new NotSupported("not supported");
    }

    public withOptions(options: IElementQueryOptions): IElementQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.options);
    }

    private async queryWorker(
        offset: number,
        limit: number,
        options: IElementQueryOptions | undefined,
    ): Promise<IElementQueryResult> {
        const { ref } = this;
        if (!isIdentifierRef(ref)) {
            throw new UnexpectedError("Tiger backend does not allow referencing objects by URI");
        }

        const response = await this.authCall((sdk) => {
            const elementsRequest: Parameters<typeof sdk.labelElements.processElementsRequest>[0] = {
                ...(options?.complement && { complementFilter: options.complement }),
                ...(options?.filter && { patternFilter: options.filter }),
                ...(options?.order && { sortOrder: options.order === "asc" ? "ASC" : "DESC" }),
                limit,
                offset,
                label: ref.identifier,
                workspaceId: this.workspace,
            };

            return sdk.labelElements.processElementsRequest(elementsRequest);
        });

        const { paging, elements } = response.data;
        const { count, total, offset: serverOffset } = paging;
        const hasNextPage = serverOffset + count < total;

        const emptyResult: IElementQueryResult = {
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            items: elements.map(
                (element): IAttributeElement => ({
                    title: element.title,
                    uri: element.primaryTitle,
                }),
            ),
            limit: count,
            offset: serverOffset,
            totalCount: total,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
        };
    }
}
