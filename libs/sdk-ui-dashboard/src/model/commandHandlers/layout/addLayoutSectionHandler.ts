// (C) 2021-2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { sanitizeHeader } from "./utils.js";
import {
    validateAndNormalizeWidgetItems,
    validateAndResolveItemFilterSettings,
} from "./validation/itemValidation.js";
import { validateSectionPlacement } from "./validation/layoutValidation.js";
import { type IItemResolutionResult, validateAndResolveStashedItems } from "./validation/stashValidation.js";
import {
    asLayoutItemPath,
    findSections,
    getParentPath,
    updateSectionIndex,
} from "../../../_staging/layout/coordinates.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { type IAddLayoutSection } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardLayoutSectionAdded, layoutSectionAdded } from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectScreen, selectStash } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import {
    type ExtendedDashboardLayoutSection,
    type InternalDashboardItemDefinition,
} from "../../types/layoutTypes.js";
import { resolveIndexOfNewItem } from "../../utils/arrayOps.js";
import { addTemporaryIdentityToWidgets } from "../../utils/dashboardItemUtils.js";

type AddLayoutSectionContext = {
    readonly ctx: DashboardContext;
    readonly cmd: IAddLayoutSection;
    readonly initialItems: InternalDashboardItemDefinition[];
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
    readonly availableInsights: ReturnType<typeof selectInsightsMap>;
};

function validateAndResolveItems(commandCtx: AddLayoutSectionContext): IItemResolutionResult {
    const {
        ctx,
        layout,
        stash,
        initialItems,
        cmd: {
            payload: { index },
        },
    } = commandCtx;

    if (!validateSectionPlacement(layout, index)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to insert new section at wrong index ${index}. There are currently ${layout.sections.length} sections.`,
        );
    }

    const stashValidationResult = validateAndResolveStashedItems(stash, initialItems);

    if (!isEmpty(stashValidationResult.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                ", ",
            )}`,
        );
    }

    return stashValidationResult;
}

export function* addLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: IAddLayoutSection,
): SagaIterator<IDashboardLayoutSectionAdded> {
    const {
        payload: { initialItems = [] },
    } = cmd;
    const commandCtx: AddLayoutSectionContext = {
        ctx,
        cmd,
        initialItems: addTemporaryIdentityToWidgets(initialItems),
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
        availableInsights: yield select(selectInsightsMap),
    };

    const stashValidationResult = validateAndResolveItems(commandCtx);
    const {
        payload: { index, initialHeader, autoResolveDateFilterDataset },
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

    const isLegacyCommand = typeof index === "number";
    const settings = yield select(selectSettings);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    const itemsWithNormalizedSize = isLegacyCommand
        ? itemsToAdd
        : itemsToAdd.map((item) => {
              const { item: itemWithNormalizedSize } = normalizeItemSizeToParent(
                  item,
                  asLayoutItemPath(index, 0),
                  commandCtx.layout,
                  settings,
                  normalizationResult.resolvedInsights.resolved,
                  screen,
              );
              return itemWithNormalizedSize;
          });

    const section: ExtendedDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        header: sanitizeHeader(initialHeader),
        items: itemsWithNormalizedSize,
    };

    yield put(
        batchActions([
            insightsActions.addInsights(normalizationResult.resolvedInsights.loaded),
            tabsActions.addSection({
                section,
                usedStashes: stashValidationResult.existing,
                index: isLegacyCommand ? { parent: undefined, sectionIndex: index } : index,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    if (!isLegacyCommand) {
        yield call(resizeParentContainers, getParentPath(index));
    }

    const relevantSections = isLegacyCommand
        ? commandCtx.layout.sections
        : findSections(commandCtx.layout, index);

    const newSectionIndex = resolveIndexOfNewItem(
        relevantSections,
        isLegacyCommand ? index : index.sectionIndex,
    );
    const updatedSectionPath = isLegacyCommand
        ? { parent: undefined, sectionIndex: newSectionIndex }
        : updateSectionIndex(index, newSectionIndex);

    return layoutSectionAdded(ctx, section, newSectionIndex, updatedSectionPath, cmd.correlationId);
}
