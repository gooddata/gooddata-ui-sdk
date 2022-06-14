// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select, call, SagaReturnType } from "redux-saga/effects";
import { asyncRequestSaga } from "../../common/asyncRequestSaga";
import { selectIsCommitedSelectionInverted } from "../../selection/selectors";
import { actions } from "../../slice";
import { selectAttributeFilterElements } from "../selectors";

/**
 * @internal
 */
export function* initSelectionSaga(): SagaIterator<void> {
    const correlationId = `init_selection_${uuidv4()}`;
    const isInverted: ReturnType<typeof selectIsCommitedSelectionInverted> = yield select(
        selectIsCommitedSelectionInverted,
    );
    const elements: ReturnType<typeof selectAttributeFilterElements> = yield select(
        selectAttributeFilterElements,
    );

    const loadSelection = () =>
        asyncRequestSaga(
            actions.attributeElementsRequest({ correlationId, elements }),
            actions.attributeElementsSuccess.match,
            actions.attributeElementsError.match,
            actions.attributeElementsCancelRequest({ correlationId }),
        );

    const { success }: SagaReturnType<typeof loadSelection> = yield call(loadSelection);

    if (success) {
        yield put(
            actions.changeSelection({
                selection: success.payload.attributeElements.map((element) => element.uri),
                isInverted,
            }),
        );
    }
}
