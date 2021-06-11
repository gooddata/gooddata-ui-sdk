// (C) 2021 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { AddLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { ExtendedDashboardLayoutSection, isStashedDashboardItemsId } from "../../types/layoutTypes";
import isEmpty from "lodash/isEmpty";
import flatMap from "lodash/flatMap";
import { layoutActions } from "../../state/layout";
import { layoutSectionAdded } from "../../events/layout";
import { validateSectionPlacement } from "./validation/layoutValidation";
import { validateStashIdentifiers } from "./validation/stashValidation";

// TODO: this needs to handle calculation of the date dataset to use for the items
export function* addLayoutSectionHandler(ctx: DashboardContext, cmd: AddLayoutSection): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const stash: ReturnType<typeof selectStash> = yield select(selectStash);

    const {
        payload: { index, initialHeader, initialItems = [] },
    } = cmd;

    if (!validateSectionPlacement(layout, index)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to insert new section at wrong index ${index}. There are currently ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const stashValidationResult = validateStashIdentifiers(stash, initialItems);

    if (!isEmpty(stashValidationResult.missing)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
                cmd.correlationId,
            ),
        );
    }

    const section: ExtendedDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        header: initialHeader,
        items: flatMap(initialItems, (item) => {
            if (isStashedDashboardItemsId(item)) {
                return stash[item];
            }

            return item;
        }),
    };

    yield put(
        layoutActions.addSection({
            section,
            usedStashes: stashValidationResult.existing,
            index,
            undo: {
                cmd,
            },
        }),
    );

    yield dispatchDashboardEvent(
        layoutSectionAdded(ctx, section, index === -1 ? layout.sections.length : index, cmd.correlationId),
    );
}
