// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { batchActions } from "redux-batched-actions";
import { SagaReturnType, put, select, call } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { MoveSectionItem } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout, selectScreen } from "../../store/layout/layoutSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionItemMoved, layoutSectionItemMoved } from "../../events/layout.js";
import { resolveIndexOfNewItem, resolveRelativeIndex } from "../../utils/arrayOps.js";
import {
    findItem,
    serializeLayoutItemPath,
    findSections,
    findSection,
    getItemIndex,
    updateItem,
    getSectionIndex,
    areItemsInSameSection,
    asSectionPath,
    getParentPath,
} from "../../../_staging/layout/coordinates.js";

import {
    validateItemExists,
    validateItemPlacement,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { resizeParentContainers } from "./containerHeightSanitization.js";

type MoveSectionItemContext = {
    readonly ctx: DashboardContext;
    readonly cmd: MoveSectionItem;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: MoveSectionItemContext) {
    const {
        ctx,
        layout,
        cmd: {
            payload: {
                sectionIndex,
                toSectionIndex,
                toItemIndex,
                itemIndex,
                fromPath,
                toPath,
                removeOriginalSectionIfEmpty,
            },
        },
    } = commandCtx;
    if (fromPath === undefined && toPath === undefined) {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        const fromSection = layout.sections[sectionIndex];

        if (!validateItemExists(fromSection, itemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move non-existent item from index ${itemIndex}. There are only ${fromSection.items.length} items.`,
            );
        }

        const itemToMove = fromSection.items[itemIndex];

        if (!validateSectionPlacement(layout, toSectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a wrong section at index ${toSectionIndex}. There are currently ${layout.sections.length} sections.`,
            );
        }

        const targetSectionIndex = resolveRelativeIndex(layout.sections, toSectionIndex);
        const targetSection = layout.sections[targetSectionIndex];

        if (!validateItemPlacement(targetSection, toItemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a wrong location at index ${toItemIndex}. Target section has ${targetSection.items.length} items.`,
            );
        }

        let targetItemIndex = 0;

        if (sectionIndex === targetSectionIndex) {
            targetItemIndex = resolveRelativeIndex(targetSection.items, toItemIndex);

            if (itemIndex === targetItemIndex) {
                throw invalidArgumentsProvided(
                    ctx,
                    commandCtx.cmd,
                    `Attempting to move item to a same place where it already resides ${toItemIndex}.`,
                );
            }
        } else {
            targetItemIndex = resolveIndexOfNewItem(targetSection.items, toItemIndex);
        }

        return {
            targetSectionIndex,
            targetItemIndex,
            itemToMove,
            shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
        };
    } else if (fromPath !== undefined && toPath !== undefined) {
        if (!validateSectionExists(layout, fromPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item from non-existent section at ${serializeLayoutItemPath(fromPath)}.`,
            );
        }

        const fromSection = findSection(layout, fromPath);

        if (!validateItemExists(fromSection, fromPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move non-existent item from index ${serializeLayoutItemPath(
                    fromPath,
                )}. There are only ${fromSection.items.length} items.`,
            );
        }

        if (!validateSectionPlacement(layout, toPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a wrong section at index ${serializeLayoutItemPath(toPath)}.`,
            );
        }

        const itemToMove = findItem(layout, fromPath);
        const targetSections = findSections(layout, toPath);
        const absoluteTargetSectionIndex = resolveRelativeIndex(targetSections, getSectionIndex(toPath));
        const targetSection = targetSections[absoluteTargetSectionIndex];

        if (!validateItemPlacement(targetSection, toPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a wrong location at index ${serializeLayoutItemPath(
                    toPath,
                )}. Target section has ${targetSection.items.length} items.`,
            );
        }

        let absoluteTargetItemIndex: number;

        if (
            areItemsInSameSection(fromPath, toPath) &&
            getSectionIndex(fromPath) === absoluteTargetSectionIndex
        ) {
            absoluteTargetItemIndex = resolveRelativeIndex(targetSection.items, getItemIndex(toPath));

            if (getItemIndex(fromPath) === absoluteTargetItemIndex) {
                throw invalidArgumentsProvided(
                    ctx,
                    commandCtx.cmd,
                    `Attempting to move item to a same place where it already resides ${serializeLayoutItemPath(
                        toPath,
                    )}.`,
                );
            }
        } else {
            absoluteTargetItemIndex = resolveIndexOfNewItem(targetSection.items, getItemIndex(toPath));
        }

        const targetIndex = updateItem(toPath, absoluteTargetSectionIndex, absoluteTargetItemIndex);

        return {
            targetIndex,
            itemToMove,
            shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
        };
    } else {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            "Both fromPath and toPath cannot be undefined at the same time.",
        );
    }
}

export function* moveSectionItemHandler(
    ctx: DashboardContext,
    cmd: MoveSectionItem,
): SagaIterator<DashboardLayoutSectionItemMoved> {
    const commandCtx: MoveSectionItemContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };

    const { targetSectionIndex, targetItemIndex, targetIndex, itemToMove, shouldRemoveSection } =
        validateAndResolve(commandCtx);
    const { fromPath, itemIndex, sectionIndex } = cmd.payload;

    const settings = yield select(selectSettings);
    const insightsMap: SagaReturnType<typeof selectInsightsMap> = yield select(selectInsightsMap);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    const { item: itemWithNormalizedSize, sizeChanged: shouldChangeSize } = normalizeItemSizeToParent(
        itemToMove,
        targetIndex,
        commandCtx.layout,
        settings,
        insightsMap,
        screen,
    );

    yield put(
        batchActions([
            layoutActions.moveSectionItem({
                itemIndex: fromPath === undefined ? [{ sectionIndex, itemIndex }] : fromPath,
                toItemIndex:
                    targetIndex === undefined
                        ? [{ sectionIndex: targetSectionIndex, itemIndex: targetItemIndex }]
                        : targetIndex,
                undo: {
                    cmd,
                },
            }),
            ...(shouldRemoveSection
                ? [
                      layoutActions.removeSection({
                          index:
                              fromPath === undefined
                                  ? { parent: undefined, sectionIndex }
                                  : asSectionPath(fromPath),
                          undo: {
                              cmd,
                          },
                      }),
                  ]
                : []),
            ...(shouldChangeSize
                ? [
                      layoutActions.changeItemWidth({
                          layoutPath:
                              targetIndex === undefined
                                  ? [{ sectionIndex: targetSectionIndex, itemIndex: targetItemIndex }]
                                  : targetIndex,
                          width: itemWithNormalizedSize.size.xl.gridWidth,
                      }),
                  ]
                : []),
        ]),
    );

    yield call(resizeParentContainers, getParentPath(fromPath));
    yield call(resizeParentContainers, getParentPath(targetIndex));

    const targetSectionIndexUpdated =
        targetSectionIndex === undefined
            ? getSectionIndex(targetIndex)
            : shouldRemoveSection && sectionIndex < targetSectionIndex
            ? sectionIndex - 1
            : targetSectionIndex;

    return layoutSectionItemMoved(
        ctx,
        itemWithNormalizedSize,
        fromPath === undefined ? sectionIndex : getSectionIndex(fromPath),
        targetSectionIndexUpdated,
        fromPath === undefined ? itemIndex : getItemIndex(fromPath),
        targetIndex === undefined ? targetItemIndex : getItemIndex(targetIndex),
        fromPath === undefined ? [{ sectionIndex, itemIndex }] : fromPath,
        targetIndex === undefined
            ? [{ sectionIndex: targetSectionIndexUpdated!, itemIndex: targetIndex! }]
            : targetIndex,
        shouldRemoveSection,
        cmd.correlationId,
    );
}
