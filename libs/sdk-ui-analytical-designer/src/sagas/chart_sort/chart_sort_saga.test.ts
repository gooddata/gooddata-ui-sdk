// (C) 2022-2026 GoodData Corporation

import { type Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { type StaticProvider } from "redux-saga-test-plan/providers";
import { describe, expect, it } from "vitest";

import { rootReducer } from "../../reducers/root_reducer.js";
import { getAppliedSort, getSortConfig } from "../../store/chart_sort/chart_sort_selector.js";
import { type IAppState } from "../../store/types.js";
import { attributeSortConfig, measureSortConfig } from "../../tests/chart_sort.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { watchChartSort } from "./chart_sort_saga.js";
import { updateAppliedChartSort, updateChartSortConfig } from "./chart_sort_ui_actions.js";

async function dispatchAction(state: IAppState, action: Action, providers: StaticProvider[] = []) {
    const { storeState } = await expectSaga(watchChartSort)
        .withReducer(rootReducer, state)
        .provide(providers)
        .dispatch(action)
        .silentRun(0);
    return storeState;
}

const buildStateWithSortConfigAndAppliedState = async () => {
    const initialSortConfigAction = updateChartSortConfig(attributeSortConfig);
    const stateWithSortConfig = await dispatchAction(getInitializedState(), initialSortConfigAction);
    const appliedStateAction = updateAppliedChartSort(attributeSortConfig.defaultSort);
    return await dispatchAction(stateWithSortConfig, appliedStateAction);
};

describe("Chart Sort saga", () => {
    describe("UI_UPDATE_CHART_SORT_CONFIG", () => {
        it("should store sort config when changed by UI action and not reset applied state when new applied sort is not defined", async () => {
            const action = updateChartSortConfig(attributeSortConfig);
            const reducedState = await dispatchAction(
                await buildStateWithSortConfigAndAppliedState(),
                action,
            );

            const sortConfig = getSortConfig(reducedState);
            const appliedState = getAppliedSort(reducedState);

            expect(sortConfig).toMatchSnapshot();
            expect(appliedState).toEqual(attributeSortConfig.defaultSort);
        });

        it("should store sort config when changed by UI action and change applied state when new sort config contains new applied sort", async () => {
            const action = updateChartSortConfig(measureSortConfig);
            const reducedState = await dispatchAction(
                await buildStateWithSortConfigAndAppliedState(),
                action,
            );

            const sortConfig = getSortConfig(reducedState);
            const appliedState = getAppliedSort(reducedState);

            expect(sortConfig).toMatchSnapshot();
            expect(appliedState).toEqual(measureSortConfig.appliedSort);
        });
    });

    describe("UI_UPDATE_APPLIED_CHART_SORT", () => {
        it("should store current sort when changed by UI action", async () => {
            const action = updateAppliedChartSort(attributeSortConfig.defaultSort);
            const reducedState = await dispatchAction(getInitializedState(), action);
            const result = getAppliedSort(reducedState);

            expect(result).toMatchSnapshot();
        });
    });
});
