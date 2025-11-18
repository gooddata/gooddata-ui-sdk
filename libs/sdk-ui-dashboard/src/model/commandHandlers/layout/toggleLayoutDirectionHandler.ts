// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import {
    IDashboardLayout,
    IInsight,
    ISettings,
    ScreenSize,
    isDashboardLayout,
    isDashboardLayoutItem,
} from "@gooddata/sdk-model";

import {
    getChildWidgetLayoutPaths,
    getChildWidgetLayoutPathsWithMinWidths,
    getUpdatedSizesOnly,
} from "./containerWidthSanitization.js";
import { findItem } from "../../../_staging/layout/coordinates.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { ToggleLayoutDirection } from "../../commands/layout.js";
import { LayoutDirectionChanged, layoutDirectionChanged } from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardWidget, IItemWithWidth } from "../../types/layoutTypes.js";

function findChildItemsWithNewWidth(
    { payload: { layoutPath, direction } }: ToggleLayoutDirection,
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    insightMap: ObjRefMap<IInsight>,
    settings: ISettings,
    screen: ScreenSize,
): IItemWithWidth[] {
    const parentPath = layoutPath === undefined ? [] : layoutPath;
    const parent = layoutPath === undefined ? layout : findItem(layout, layoutPath);

    if (isDashboardLayoutItem(parent) && isDashboardLayout(parent.widget)) {
        return direction === "row"
            ? getChildWidgetLayoutPathsWithMinWidths(parent.widget, parentPath, settings, insightMap, screen)
            : getChildWidgetLayoutPaths(parent.widget, parentPath).map((itemPath) => ({
                  itemPath,
                  width: parent.size.xl.gridWidth,
              }));
    }
    return [];
}

export function* toggleLayoutDirectionHandler(
    ctx: DashboardContext,
    cmd: ToggleLayoutDirection,
): SagaIterator<LayoutDirectionChanged> {
    const { layoutPath, direction } = cmd.payload;

    // select necessary data from the state first, to not have a direction modified before children are queried
    const layout = yield select(selectLayout);
    const insightMap = yield select(selectInsightsMap);
    const screen = yield select(selectScreen);
    const settings = yield select(selectSettings);

    yield put(
        tabsActions.toggleLayoutDirection({
            layoutPath,
            direction,
            undo: {
                cmd,
            },
        }),
    );

    const childItemsWithNewWidth: IItemWithWidth[] = findChildItemsWithNewWidth(
        cmd,
        layout,
        insightMap,
        settings,
        screen,
    );
    const itemsWithUpdatedWidth = getUpdatedSizesOnly(layout, childItemsWithNewWidth, screen);

    if (itemsWithUpdatedWidth.length > 0) {
        yield put(
            tabsActions.updateWidthOfMultipleItems({
                itemsWithSizes: itemsWithUpdatedWidth,
            }),
        );
    }

    return layoutDirectionChanged(ctx, layoutPath, direction, cmd.correlationId);
}
