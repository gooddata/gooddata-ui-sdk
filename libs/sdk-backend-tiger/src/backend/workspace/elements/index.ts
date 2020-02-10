// (C) 2019-2020 GoodData Corporation
import {
    IElementQueryFactory,
    IElementQuery,
    IElementQueryOptions,
    IElementQueryResult,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { elements } from "./mocks/elements";

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
        // @ts-ignore We are using mocks, so ignore for now - remove once it's implemented
        private readonly ref: ObjRef,
        // @ts-ignore We are using mocks, so ignore for now - remove once it's implemented
        private readonly workspace: string,
    ) {}

    public withLimit(limit: number): IElementQuery {
        invariant(limit > 0, "limit must be a positive number");

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementQuery {
        this.offset = offset;
        return this;
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
        // @ts-ignore
        options: IElementQueryOptions | undefined,
    ): Promise<IElementQueryResult> {
        const emptyResult: IElementQueryResult = {
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
        };

        const dummyResult = await this.authCall(async () => {
            const result: IElementQueryResult = {
                items: elements,
                limit,
                offset,
                totalCount: elements.length,
                next: () => Promise.resolve(emptyResult),
            };

            return result;
        });

        return dummyResult;
    }
}
