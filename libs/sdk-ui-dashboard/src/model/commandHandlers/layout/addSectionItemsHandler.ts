// (C) 2021-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import {
    validateAndNormalizeWidgetItems,
    validateAndResolveItemFilterSettings,
} from "./validation/itemValidation.js";
import { validateItemPlacement, validateSectionExists } from "./validation/layoutValidation.js";
import { validateAndResolveStashedItems } from "./validation/stashValidation.js";
import {
    findSection,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    serializeLayoutItemPath,
    updateItemIndex,
} from "../../../_staging/layout/coordinates.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { AddSectionItems } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardLayoutSectionItemsAdded, layoutSectionItemsAdded } from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout, selectScreen, selectStash } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardLayoutSection, InternalDashboardItemDefinition } from "../../types/layoutTypes.js";
import { resolveIndexOfNewItem } from "../../utils/arrayOps.js";
import { addTemporaryIdentityToWidgets } from "../../utils/dashboardItemUtils.js";

type AddSectionItemsContext = {
    readonly ctx: DashboardContext;
    readonly cmd: AddSectionItems;
    readonly items: InternalDashboardItemDefinition[];
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
    readonly availableInsights: ReturnType<typeof selectInsightsMap>;
};

function validateAndResolveItems(commandCtx: AddSectionItemsContext) {
    const {
        ctx,
        layout,
        stash,
        items,
        cmd: {
            payload: { itemPath, itemIndex, sectionIndex },
        },
    } = commandCtx;
    if (itemPath === undefined) {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to add items to non-existing layout section at index ${sectionIndex}.`,
            );
        }

        const section: ExtendedDashboardLayoutSection = layout.sections[sectionIndex];

        if (!validateItemPlacement(section, itemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to insert new item at wrong index ${itemIndex}. There are currently ${section.items.length} items.`,
            );
        }

        const stashValidationResult = validateAndResolveStashedItems(stash, items);

        if (!isEmpty(stashValidationResult.missing)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
            );
        }

        return {
            stashValidationResult,
            section,
        };
    } else {
        if (!validateSectionExists(layout, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to add items to non-existing layout section at index ${serializeLayoutItemPath(
                    itemPath,
                )}.`,
            );
        }

        const section: ExtendedDashboardLayoutSection = findSection(layout, itemPath);

        if (!validateItemPlacement(section, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to insert new item at wrong index ${serializeLayoutItemPath(
                    itemPath,
                )}. There are currently ${section.items.length} items.`,
            );
        }

        const stashValidationResult = validateAndResolveStashedItems(stash, items);

        if (!isEmpty(stashValidationResult.missing)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
            );
        }

        return {
            stashValidationResult,
            section,
        };
    }
}

export function* addSectionItemsHandler(
    ctx: DashboardContext,
    cmd: AddSectionItems,
): SagaIterator<DashboardLayoutSectionItemsAdded> {
    const {
        payload: { items },
    } = cmd;
    const commandCtx: AddSectionItemsContext = {
        ctx,
        cmd,
        items: addTemporaryIdentityToWidgets(items),
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
        availableInsights: yield select(selectInsightsMap),
    };

    const { stashValidationResult, section } = validateAndResolveItems(commandCtx);
    const {
        payload: { itemPath, sectionIndex, itemIndex, autoResolveDateFilterDataset },
    } = cmd;

    const normalizationResult: SagaReturnType<typeof validateAndNormalizeWidgetItems> = yield call(
        validateAndNormalizeWidgetItems,
        ctx,
        stashValidationResult,
        cmd,
    );

    const itemsToAdd: SagaReturnType<typeof validateAndResolveItemFilterSettings> = yield call(
        validateAndResolveItemFilterSettings,
        ctx,
        cmd,
        normalizationResult,
        autoResolveDateFilterDataset,
    );

    const layoutPath = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;
    const settings = yield select(selectSettings);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    const itemsWithNormalizedSize = itemsToAdd.map((item) => {
        const { item: itemWithNormalizedSize } = normalizeItemSizeToParent(
            item,
            layoutPath,
            commandCtx.layout,
            settings,
            normalizationResult.resolvedInsights.resolved,
            screen,
        );
        return itemWithNormalizedSize;
    });

    yield put(
        batchActions([
            insightsActions.addInsights(normalizationResult.resolvedInsights.loaded),
            layoutActions.addSectionItems({
                layoutPath,
                items: itemsWithNormalizedSize,
                usedStashes: stashValidationResult.existing,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    yield call(resizeParentContainers, getParentPath(layoutPath));

    const originalItemIndex = itemPath === undefined ? itemIndex : getItemIndex(itemPath);
    const newItemIndex = resolveIndexOfNewItem(section.items, originalItemIndex);
    const updatedLayoutPath =
        itemPath === undefined
            ? [{ sectionIndex, itemIndex: newItemIndex }]
            : updateItemIndex(itemPath, newItemIndex);

    return layoutSectionItemsAdded(
        ctx,
        sectionIndex === undefined ? getSectionIndex(updatedLayoutPath) : sectionIndex,
        newItemIndex,
        updatedLayoutPath,
        itemsWithNormalizedSize,
        stashValidationResult.existing,
        cmd.correlationId,
    );
}
