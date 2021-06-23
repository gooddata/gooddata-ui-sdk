// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { SagaIterator } from "redux-saga";
import {
    CaseReducer,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityId,
    EntityState,
    IdSelector,
    OutputSelector,
    PayloadAction,
    Slice,
} from "@reduxjs/toolkit";
import { DashboardQueryType, IDashboardQuery } from "../../queries/base";
import { DashboardState } from "../types";
import { CaseReducerActions } from "@reduxjs/toolkit/src/createSlice";
import { call, put, SagaReturnType, select } from "redux-saga/effects";

/**
 *
 */
export interface IDashboardQueryService<TQuery extends IDashboardQuery, TResult> {
    name: DashboardQueryType;
    generator: (ctx: DashboardContext, query: TQuery) => SagaIterator<TResult>;
    cache: QueryCache<TQuery, TResult>;
}

type QueryCacheEntry<TQuery extends IDashboardQuery, TResult> = {
    query: TQuery;
    result: TResult;
};

type QueryCacheReducer<TQuery extends IDashboardQuery, TResult, TPayload> = CaseReducer<
    EntityState<QueryCacheEntry<TQuery, TResult>>,
    PayloadAction<TPayload>
>;

type AllQueryCacheReducers<TQuery extends IDashboardQuery, TResult> = {
    set: QueryCacheReducer<TQuery, TResult, QueryCacheEntry<TQuery, TResult>>;
    remove: QueryCacheReducer<TQuery, TResult, string>;
    removeAll: QueryCacheReducer<TQuery, TResult, void>;
};

type QueryActions<TQuery extends IDashboardQuery, TResult> = CaseReducerActions<
    AllQueryCacheReducers<TQuery, TResult>
>;

type QueryCache<TQuery extends IDashboardQuery, TResult> = {
    slice: Slice<
        EntityState<QueryCacheEntry<TQuery, TResult>>,
        AllQueryCacheReducers<TQuery, TResult>,
        string
    >;
    actions: QueryActions<TQuery, TResult>;
    selectById: (
        id: EntityId,
    ) => OutputSelector<DashboardState, TResult | undefined, (res: DashboardState) => TResult | undefined>;
};

function createQueryCacheSlice<TQuery extends IDashboardQuery, TResult>(
    queryName: string,
    selectId: IdSelector<TQuery>,
): QueryCache<TQuery, TResult> {
    const cacheEntryId = (entry: QueryCacheEntry<TQuery, TResult>) => selectId(entry.query);
    const adapter = createEntityAdapter({ selectId: cacheEntryId });
    // TODO: getting massive typing error here, don't know how to solve it
    const reducers: AllQueryCacheReducers<TQuery, TResult> = {
        set: adapter.addOne as any,
        remove: adapter.removeOne as any,
        removeAll: adapter.removeAll as any,
    };

    const slice = createSlice<
        EntityState<QueryCacheEntry<TQuery, TResult>>,
        AllQueryCacheReducers<TQuery, TResult>
    >({
        name: queryName,
        initialState: adapter.getInitialState(),
        reducers,
    });

    const selectors = adapter.getSelectors((state: DashboardState) => state._queryCache[queryName]);
    const selectById = (id: EntityId) => {
        return createSelector(
            (state: DashboardState) => state,
            (state) => {
                return selectors.selectById(state, id)?.result;
            },
        );
    };

    return {
        slice,
        actions: slice.actions,
        selectById,
    };
}

export type QueryServiceCachingConfig<TQuery extends IDashboardQuery, TResult> = {
    queryName: DashboardQueryType;
    generator: (ctx: DashboardContext, query: TQuery) => SagaIterator<TResult>;
    queryToCacheKey: (query: TQuery) => EntityId;
};

export function createCachedQueryService<TQuery extends IDashboardQuery, TResult>(
    config: QueryServiceCachingConfig<TQuery, TResult>,
): IDashboardQueryService<TQuery, TResult> {
    const { queryName, queryToCacheKey, generator } = config;
    const queryCache = createQueryCacheSlice<TQuery, TResult>(queryName, queryToCacheKey);

    function* generatorWithQueryCache(ctx: DashboardContext, query: TQuery): SagaIterator<TResult> {
        const cacheKey = queryToCacheKey(query);
        const cachedResult = yield select(queryCache.selectById(cacheKey));

        if (cachedResult) {
            return cachedResult;
        }

        const result: SagaReturnType<typeof generator> = yield call(generator, ctx, query);

        yield put(
            queryCache.actions.set({
                query,
                result,
            }),
        );

        return result;
    }

    return {
        name: queryName,
        generator: generatorWithQueryCache,
        cache: queryCache,
    };
}
