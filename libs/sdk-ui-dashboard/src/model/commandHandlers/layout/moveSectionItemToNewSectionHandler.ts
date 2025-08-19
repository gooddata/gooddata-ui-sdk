// (C) 2021-2025 GoodData Corporation
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { buildRowContainerSanitizationActions } from "./rowContainerSanitization.js";
import {
    validateItemExists,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation.js";
import {
    areLayoutPathsEqual,
    asLayoutItemPath,
    asSectionPath,
    findItem,
    findSection,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    serializeLayoutItemPath,
    serializeLayoutSectionPath,
} from "../../../_staging/layout/coordinates.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { ILayoutItemPath } from "../../../types.js";
import { MoveSectionItemToNewSection } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    DashboardLayoutSectionItemMovedToNewSection,
    layoutSectionItemMovedToNewSection,
} from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout, selectScreen } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes.js";

type MoveSectionItemToNewSectionContext = {
    readonly ctx: DashboardContext;
    readonly cmd: MoveSectionItemToNewSection;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: MoveSectionItemToNewSectionContext) {
    const {
        ctx,
        layout,
        cmd: {
            payload: {
                itemPath,
                sectionIndex,
                itemIndex,
                toSectionIndex,
                toSection,
                removeOriginalSectionIfEmpty,
            },
        },
    } = commandCtx;

    if (itemPath === undefined && toSection === undefined) {
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

        return {
            targetSectionIndex: toSectionIndex,
            targetItemIndex: 0,
            itemToMove,
            shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
        };
    } else if (itemPath !== undefined && toSection !== undefined) {
        if (!validateSectionExists(layout, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item from non-existent section at ${serializeLayoutItemPath(itemPath)}.`,
            );
        }

        const fromSection = findSection(layout, itemPath);

        if (!validateItemExists(fromSection, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move non-existent item from index ${serializeLayoutItemPath(
                    itemPath,
                )}. There are only ${fromSection.items.length} items.`,
            );
        }

        const itemToMove = findItem(layout, itemPath);

        if (!validateSectionPlacement(layout, toSection)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a wrong section at index ${serializeLayoutSectionPath(
                    toSection,
                )}.`,
            );
        }

        return {
            itemToMove,
            toItemIndex: asLayoutItemPath(toSection, 0),
            shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
        };
    } else {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            "Both itemPath and toSection cannot be undefined at the same time.",
        );
    }
}

function toIsBeforeFrom(toItemPath: ILayoutItemPath, fromItemPath: ILayoutItemPath) {
    return getSectionIndex(toItemPath) <= getSectionIndex(fromItemPath);
}

function requiresSectionShift(fromItemPath: ILayoutItemPath, toItemPath: ILayoutItemPath) {
    const commonPath = fromItemPath.slice(0, toItemPath.length);
    const commonPathParent = getParentPath(commonPath);
    const toItemPathParent = getParentPath(toItemPath);

    const emptyOrSameParent =
        (commonPathParent === undefined && toItemPathParent === undefined) ||
        (commonPathParent !== undefined &&
            toItemPathParent !== undefined &&
            areLayoutPathsEqual(commonPathParent, toItemPathParent));
    return emptyOrSameParent && toIsBeforeFrom(toItemPath, commonPath);
}

function getItemPathWithSectionsShifted(
    fromItemPath: ILayoutItemPath | undefined,
    toItemPath: ILayoutItemPath | undefined,
) {
    if (fromItemPath && toItemPath && requiresSectionShift(fromItemPath, toItemPath)) {
        const fromItemPathCopy = fromItemPath.slice();
        fromItemPathCopy[toItemPath.length - 1] = {
            sectionIndex: fromItemPathCopy[toItemPath.length - 1].sectionIndex + 1,
            itemIndex: fromItemPathCopy[toItemPath.length - 1].itemIndex,
        };
        return fromItemPathCopy;
    }
    return fromItemPath;
}

export function* moveSectionItemToNewSectionHandler(
    ctx: DashboardContext,
    cmd: MoveSectionItemToNewSection,
): SagaIterator<DashboardLayoutSectionItemMovedToNewSection> {
    const commandCtx: MoveSectionItemToNewSectionContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };

    const { targetSectionIndex, targetItemIndex, itemToMove, toItemIndex, shouldRemoveSection } =
        validateAndResolve(commandCtx);
    const { itemIndex, sectionIndex, toSectionIndex, itemPath } = cmd.payload;
    const itemSectionIndex =
        itemPath === undefined
            ? toSectionIndex > sectionIndex
                ? sectionIndex
                : sectionIndex + 1
            : getSectionIndex(itemPath);

    const section: ExtendedDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        items: [],
    };

    const itemPathWithSectionsShifted = getItemPathWithSectionsShifted(itemPath, toItemIndex);

    const settings = yield select(selectSettings);
    const insightsMap = yield select(selectInsightsMap);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    const { item: itemWithNormalizedSize, sizeChanged: shouldChangeSize } = normalizeItemSizeToParent(
        itemToMove,
        toItemIndex,
        commandCtx.layout,
        settings,
        insightsMap,
        screen,
    );

    const sourceItemIndex = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;
    const destinationItemIndex =
        toItemIndex === undefined
            ? [{ sectionIndex: targetSectionIndex, itemIndex: targetItemIndex }]
            : toItemIndex;

    const rowContainerSanitizationActions = buildRowContainerSanitizationActions(
        cmd,
        commandCtx.layout,
        itemWithNormalizedSize,
        sourceItemIndex,
        destinationItemIndex,
        screen!,
    );

    yield put(
        batchActions([
            // process actions not mutating layout paths first to avoid remapping of the paths in them
            ...rowContainerSanitizationActions,
            ...(shouldChangeSize
                ? [
                      layoutActions.changeItemWidth({
                          layoutPath: sourceItemIndex,
                          width: itemWithNormalizedSize.size.xl.gridWidth,
                      }),
                  ]
                : []),
            // changes section index
            layoutActions.addSection({
                index:
                    toItemIndex === undefined
                        ? { parent: undefined, sectionIndex: targetSectionIndex }
                        : asSectionPath(toItemIndex),
                section,
                usedStashes: [],
                undo: {
                    cmd,
                },
            }),
            // changes item index
            layoutActions.moveSectionItem({
                itemIndex:
                    itemPathWithSectionsShifted === undefined
                        ? [{ sectionIndex: itemSectionIndex, itemIndex }]
                        : itemPathWithSectionsShifted,
                toItemIndex: destinationItemIndex,
                undo: {
                    cmd,
                },
            }),
            ...(shouldRemoveSection
                ? [
                      layoutActions.removeSection({
                          index:
                              itemPathWithSectionsShifted === undefined
                                  ? { parent: undefined, sectionIndex: itemSectionIndex }
                                  : asSectionPath(itemPathWithSectionsShifted),
                          undo: {
                              cmd,
                          },
                      }),
                  ]
                : []),
        ]),
    );

    yield call(resizeParentContainers, getParentPath(itemPath));
    yield call(resizeParentContainers, getParentPath(toItemIndex));

    return layoutSectionItemMovedToNewSection(
        ctx,
        itemWithNormalizedSize,
        itemPath === undefined ? sectionIndex : getSectionIndex(itemPath),
        targetSectionIndex === undefined ? getSectionIndex(toItemIndex) : targetSectionIndex,
        itemPath === undefined ? itemIndex : getItemIndex(itemPath),
        targetItemIndex === undefined ? getItemIndex(toItemIndex) : targetItemIndex,
        itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath,
        toItemIndex === undefined
            ? [{ sectionIndex: targetSectionIndex, itemIndex: targetItemIndex }]
            : toItemIndex,
        shouldRemoveSection,
        cmd.correlationId,
    );
}
