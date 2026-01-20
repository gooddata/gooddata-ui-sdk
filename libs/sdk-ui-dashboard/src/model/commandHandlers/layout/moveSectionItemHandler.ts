// (C) 2021-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { buildRowContainerSanitizationActions } from "./rowContainerSanitization.js";
import {
    validateItemExists,
    validateItemPlacement,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation.js";
import {
    areItemsInSameSection,
    areLayoutPathsEqual,
    asSectionPath,
    findItem,
    findSection,
    findSections,
    getCommonPath,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    serializeLayoutItemPath,
    updateItem,
} from "../../../_staging/layout/coordinates.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { type ILayoutItemPath, type ILayoutSectionPath } from "../../../types.js";
import { type IMoveSectionItem } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardLayoutSectionItemMoved, layoutSectionItemMoved } from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { resolveIndexOfNewItem, resolveRelativeIndex } from "../../utils/arrayOps.js";

type MoveSectionItemContext = {
    readonly ctx: DashboardContext;
    readonly cmd: IMoveSectionItem;
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

function toIsBeforeFrom(toItemPath: ILayoutItemPath, fromItemPath: ILayoutItemPath) {
    return (
        getSectionIndex(toItemPath) === getSectionIndex(fromItemPath) &&
        getItemIndex(toItemPath) <= getItemIndex(fromItemPath)
    );
}

function requiresItemShift(fromItemPath: ILayoutItemPath, toItemPath: ILayoutItemPath) {
    const commonPath = fromItemPath.slice(0, toItemPath.length);
    const commonPathParent = getParentPath(commonPath);
    const toItemPathParent = getParentPath(toItemPath);
    return (
        commonPathParent !== undefined &&
        toItemPathParent !== undefined &&
        areLayoutPathsEqual(commonPathParent, toItemPathParent) &&
        toIsBeforeFrom(toItemPath, commonPath)
    );
}

export function getSectionPathWithItemsShifted(
    fromItemPath: ILayoutItemPath,
    toItemPath: ILayoutItemPath = [],
): ILayoutSectionPath {
    if (fromItemPath && toItemPath && requiresItemShift(fromItemPath, toItemPath)) {
        const fromItemPathParent = getParentPath(fromItemPath);
        const toItemPathParent = getParentPath(toItemPath);
        const commonPath =
            fromItemPathParent && toItemPathParent ? getCommonPath(fromItemPathParent, toItemPathParent) : [];

        const pathWithShiftedIndex = [
            ...commonPath,
            {
                sectionIndex: fromItemPath[commonPath.length].sectionIndex,
                itemIndex: fromItemPath[commonPath.length].itemIndex + 1,
            },
            ...fromItemPath.slice(commonPath.length + 1),
        ];

        return asSectionPath(pathWithShiftedIndex);
    }
    return asSectionPath(fromItemPath);
}

export function* moveSectionItemHandler(
    ctx: DashboardContext,
    cmd: IMoveSectionItem,
): SagaIterator<IDashboardLayoutSectionItemMoved> {
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
    const currentItemIndex = fromPath === undefined ? [{ sectionIndex, itemIndex }] : fromPath;
    const toItemIndex =
        targetIndex === undefined
            ? [{ sectionIndex: targetSectionIndex, itemIndex: targetItemIndex }]
            : targetIndex;

    const rowContainerSanitizationActions = buildRowContainerSanitizationActions(
        cmd,
        commandCtx.layout,
        itemWithNormalizedSize,
        currentItemIndex,
        toItemIndex,
        screen!,
    );

    yield put(
        batchActions([
            // process actions not mutating layout paths first to avoid remapping of the paths in them
            ...rowContainerSanitizationActions,
            ...(shouldChangeSize
                ? [
                      tabsActions.changeItemWidth({
                          layoutPath: currentItemIndex,
                          width: itemWithNormalizedSize.size.xl.gridWidth,
                      }),
                  ]
                : []),
            // changes item index
            tabsActions.moveSectionItem({
                itemIndex: currentItemIndex,
                toItemIndex,
                undo: {
                    cmd,
                },
            }),
            ...(shouldRemoveSection
                ? [
                      tabsActions.removeSection({
                          index:
                              fromPath === undefined
                                  ? { parent: undefined, sectionIndex }
                                  : getSectionPathWithItemsShifted(fromPath, targetIndex),
                          undo: {
                              cmd,
                          },
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
            ? [{ sectionIndex: targetSectionIndexUpdated, itemIndex: targetIndex! }]
            : targetIndex,
        shouldRemoveSection,
        cmd.correlationId,
    );
}
