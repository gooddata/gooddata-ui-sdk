// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { idRef } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { asLayoutItemPath } from "../../../../_staging/layout/coordinates.js";
import { getInsightPlaceholderSizeInfo } from "../../../../_staging/layout/sizing.js";
import { addNestedLayoutSection } from "../../../../model/commands/layout.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { selectSettings } from "../../../../model/store/config/configSelectors.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import {
    INSIGHT_PLACEHOLDER_WIDGET_ID,
    newInsightPlaceholderWidget,
} from "../../../../widgets/placeholders/types.js";

export function useNewSectionInsightPlaceholderDropHandler(sectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const layoutPath = useMemo(() => asLayoutItemPath(sectionIndex, 0), [sectionIndex]);
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

    const { run: addNewSectionWithInsightPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const defaultItemSize = getInsightPlaceholderSizeInfo(settings);
        const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);

        addNewSectionWithInsightPlaceholder(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: itemSize.height.default!,
                        gridWidth: itemSize.width.default!,
                    },
                },
                widget: newInsightPlaceholderWidget(),
            },
        ]);
    }, [addNewSectionWithInsightPlaceholder, sectionIndex, settings, updateWidgetDefaultSizeByParent]);
}
