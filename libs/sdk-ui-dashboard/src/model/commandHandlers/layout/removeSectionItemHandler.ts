// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import {
    asSectionPath,
    findItem,
    findSection,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    serializeLayoutItemPath,
} from "../../../_staging/layout/coordinates.js";
import { RemoveSectionItem, RemoveSectionItemByWidgetRef } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { layoutSectionItemRemoved, layoutSectionRemoved } from "../../events/layout.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes.js";

type RemoveSectionItemContext = {
    readonly ctx: DashboardContext;
    readonly cmd: Omit<RemoveSectionItem, "type">;
    originalCmd: RemoveSectionItem | RemoveSectionItemByWidgetRef;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: RemoveSectionItemContext) {
    const {
        ctx,
        cmd: {
            payload: { itemIndex, sectionIndex, itemPath },
        },
        layout,
    } = commandCtx;

    if (itemPath === undefined) {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.originalCmd,
                `Attempting to remove item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        const fromSection = layout.sections[sectionIndex];

        if (!validateItemExists(fromSection, itemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.originalCmd,
                `Attempting to remove non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
            );
        }

        const itemToRemove = fromSection.items[itemIndex];

        return {
            fromSection,
            itemToRemove,
        };
    } else {
        if (!validateSectionExists(layout, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.originalCmd,
                `Attempting to remove item from non-existent section at ${
                    itemPath ? serializeLayoutItemPath(itemPath) : undefined
                }.`,
            );
        }

        const fromSection = findSection(layout, itemPath);

        if (!validateItemExists(fromSection, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.originalCmd,
                `Attempting to remove non-existent item from index ${serializeLayoutItemPath(
                    itemPath,
                )}. There are only ${fromSection.items.length} items in this section.`,
            );
        }

        const itemToRemove = findItem(layout, itemPath);

        return {
            fromSection,
            itemToRemove,
        };
    }
}

export function* removeSectionItemHandler(ctx: DashboardContext, cmd: RemoveSectionItem): SagaIterator<void> {
    return yield call(removeSectionItemSaga, ctx, cmd);
}

export function* removeSectionItemSaga(
    ctx: DashboardContext,
    cmd: RemoveSectionItem | RemoveSectionItemContext["cmd"],
    originalCmd: RemoveSectionItemByWidgetRef = cmd as any,
): SagaIterator<void> {
    const commandCtx: RemoveSectionItemContext = {
        ctx,
        cmd,
        originalCmd,
        layout: yield select(selectLayout),
    };

    const { fromSection, itemToRemove } = validateAndResolve(commandCtx);
    const { sectionIndex, itemIndex, itemPath, eager, stashIdentifier } = cmd.payload;

    if (eager && fromSection.items.length === 1) {
        yield put(
            layoutActions.removeSection({
                index: itemPath === undefined ? { parent: undefined, sectionIndex } : asSectionPath(itemPath),
                stashIdentifier,
                undo: {
                    cmd: originalCmd,
                },
            }),
        );

        // normally should do select to get state after the update, however this update is straightforward
        // and can be reconstructed no-problem here.
        const sectionWithEmptyItems: ExtendedDashboardLayoutSection = {
            ...fromSection,
            items: [],
        };

        yield dispatchDashboardEvent(
            layoutSectionItemRemoved(
                ctx,
                itemToRemove,
                itemPath === undefined ? itemIndex : getItemIndex(itemPath),
                itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath,
                sectionWithEmptyItems,
                stashIdentifier,
                cmd.correlationId,
            ),
        );

        yield call(resizeParentContainers, getParentPath(itemPath));

        yield dispatchDashboardEvent(
            layoutSectionRemoved(
                ctx,
                sectionWithEmptyItems,
                itemPath === undefined ? sectionIndex : getSectionIndex(itemPath),
                itemPath === undefined ? { parent: undefined, sectionIndex } : asSectionPath(itemPath),
                true,
                undefined,
                cmd.correlationId,
            ),
        );
    } else {
        yield put(
            layoutActions.removeSectionItem({
                itemIndex: itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath,
                stashIdentifier,
                undo: {
                    cmd: originalCmd,
                },
            }),
        );

        yield call(resizeParentContainers, getParentPath(itemPath));

        yield dispatchDashboardEvent(
            layoutSectionItemRemoved(
                ctx,
                itemToRemove,
                itemPath === undefined ? itemIndex : getItemIndex(itemPath),
                itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath,
                undefined,
                stashIdentifier,
                cmd.correlationId,
            ),
        );
    }
}
