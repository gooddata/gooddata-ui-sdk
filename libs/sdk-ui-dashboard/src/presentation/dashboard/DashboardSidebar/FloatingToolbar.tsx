// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type Ref, useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import { type ObjRef, idRef } from "@gooddata/sdk-model";
import {
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    useInsightPickerState,
} from "@gooddata/sdk-ui-ext";
import {
    GD_COLOR_HIGHLIGHT,
    IconAttributeFilter,
    IconColumnContainer,
    IconInsight,
    IconInsightPicker,
    IconRichText,
    IconVisualizationSwitcher,
    isActionKey,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing.js";
import { addLayoutSection, addSectionItem } from "../../../model/commands/layout.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { dispatchAndWaitFor } from "../../../model/store/_infra/dispatchAndWaitFor.js";
import {
    selectBackendCapabilities,
    selectSupportsRichTextWidgets,
} from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableKDRichText,
    selectEnableVisualizationSwitcher,
    selectSettings,
} from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectFilterContextFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectLayout } from "../../../model/store/tabs/layout/layoutSelectors.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { selectCurrentUser } from "../../../model/store/user/userSelectors.js";
import { type DashboardItemDefinition } from "../../../model/types/layoutTypes.js";
import { getAuthor } from "../../../model/utils/author.js";
import {
    INSIGHT_PLACEHOLDER_WIDGET_ID,
    newInsightPlaceholderWidget,
} from "../../../widgets/placeholders/types.js";
import { gdColorStateBlank } from "../../constants/colors.js";
import { useWidgetDragEndHandler } from "../../dragAndDrop/draggableWidget/useWidgetDragEndHandler.js";
import { type DraggableItem } from "../../dragAndDrop/types.js";
import { useDashboardDrag } from "../../dragAndDrop/useDashboardDrag.js";

import { InsightPickerPanel } from "./InsightPickerPanel.js";

const ICON_SIZE = 28;

const ATTRIBUTE_FILTER_DRAG_ITEM: DraggableItem = {
    type: "attributeFilter-placeholder",
};

const INSIGHT_PLACEHOLDER_DRAG_ITEM: DraggableItem = {
    type: "insight-placeholder",
    size: {
        gridHeight: INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
    },
};

const RICH_TEXT_DRAG_ITEM: DraggableItem = {
    type: "richTextListItem",
    size: {
        gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
    },
};

const VIS_SWITCHER_DRAG_ITEM: DraggableItem = {
    type: "visualizationSwitcherListItem",
    size: {
        gridHeight: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
    },
};

const DASHBOARD_LAYOUT_DRAG_ITEM: DraggableItem = {
    type: "dashboardLayoutListItem",
    size: {
        gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default,
    },
};

function DraggableToolbarButton({
    icon,
    label,
    dragItem,
    testSelector,
    onMouseDown,
    onActivate,
}: {
    icon: React.ReactElement;
    label: string;
    dragItem: DraggableItem;
    testSelector: string;
    onMouseDown?: () => void;
    onActivate?: () => void;
}) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const onDragEnd = useWidgetDragEndHandler();
    const { deselectWidgets } = useWidgetSelection();

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem,
            canDrag: isInEditMode,
            hideDefaultPreview: false,
            dragEnd: () => {
                onDragEnd?.();
            },
            dragStart: () => deselectWidgets(),
        },
        [isInEditMode, dragItem],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isActionKey(e)) {
                e.preventDefault();
                onActivate?.();
            }
        },
        [onActivate],
    );

    return (
        <div
            ref={dragRef as unknown as Ref<HTMLDivElement>}
            className={cx("gd-floating-toolbar__button", testSelector, { "is-dragging": isDragging })}
            role="button"
            tabIndex={0}
            onMouseDown={onMouseDown}
            onClick={onActivate}
            onKeyDown={handleKeyDown}
        >
            {icon}
            <span className="gd-floating-toolbar__button-label">{label}</span>
        </div>
    );
}

/**
 * Adds an item to the end of the last section in the layout.
 * If the layout has no sections, creates a new one.
 * After adding, optionally selects the widget and opens the config panel.
 */
async function addItemAtEndOfLayout(
    dispatch: ReturnType<typeof useDashboardDispatch>,
    layout: ReturnType<typeof selectLayout>,
    item: DashboardItemDefinition,
    widgetRef?: ObjRef,
) {
    if (layout.sections.length > 0) {
        await dispatchAndWaitFor(dispatch, addSectionItem(layout.sections.length - 1, -1, item, true));
    } else {
        await dispatchAndWaitFor(dispatch, addLayoutSection(-1, undefined, [item], true));
    }
    if (widgetRef) {
        dispatch(uiActions.selectWidget(widgetRef));
        dispatch(uiActions.setConfigurationPanelOpened(true));
    }
}

/**
 * @internal
 */
export function FloatingToolbar() {
    const theme = useTheme();
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const primaryColor = theme?.palette?.primary?.base ?? GD_COLOR_HIGHLIGHT;
    const supportsRichText = useDashboardSelector(selectSupportsRichTextWidgets);
    const enableRichText = useDashboardSelector(selectEnableKDRichText);
    const enableVisualizationSwitcher = useDashboardSelector(selectEnableVisualizationSwitcher);
    const layout = useDashboardSelector(selectLayout);
    const settings = useDashboardSelector(selectSettings);
    const filterContextFilters = useDashboardSelector(selectFilterContextFilters);
    const [isInsightPickerOpen, setIsInsightPickerOpen] = useState(false);

    // Picker state — persists across open/close
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const author = getAuthor(capabilities, currentUser);
    const pickerState = useInsightPickerState(author);

    const toggleInsightPicker = useCallback(() => {
        setIsInsightPickerOpen((prev) => !prev);
    }, []);

    const closeInsightPicker = useCallback(() => {
        setIsInsightPickerOpen(false);
    }, []);

    const handleInsightPlaceholderActivate = useCallback(() => {
        closeInsightPicker();
        const sizeInfo = getInsightPlaceholderSizeInfo(settings);
        const item: DashboardItemDefinition = {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: newInsightPlaceholderWidget(),
        };
        void addItemAtEndOfLayout(dispatch, layout, item, idRef(INSIGHT_PLACEHOLDER_WIDGET_ID));
    }, [dispatch, layout, settings, closeInsightPicker]);

    const handleDashboardLayoutActivate = useCallback(() => {
        closeInsightPicker();
        const id = uuidv4();
        const ref = idRef(id);
        const item: DashboardItemDefinition = {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default,
                    gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default,
                },
            },
            widget: {
                type: "IDashboardLayout",
                identifier: id,
                sections: [],
                ref,
                uri: `/${id}`,
                configuration: {
                    direction: "column",
                    sections: {
                        enableHeader: false,
                    },
                },
            },
        };
        void addItemAtEndOfLayout(dispatch, layout, item, ref);
    }, [dispatch, layout, closeInsightPicker]);

    const handleVisSwitcherActivate = useCallback(() => {
        closeInsightPicker();
        const id = uuidv4();
        const ref = idRef(id);
        const item: DashboardItemDefinition = {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.height.default,
                    gridWidth: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
                },
            },
            widget: {
                type: "visualizationSwitcher",
                visualizations: [],
                description: "",
                drills: [],
                ignoreDashboardFilters: [],
                title: "",
                identifier: id,
                ref,
                uri: `/${id}`,
            },
        };
        void addItemAtEndOfLayout(dispatch, layout, item, ref);
    }, [dispatch, layout, closeInsightPicker]);

    const handleRichTextActivate = useCallback(() => {
        closeInsightPicker();
        const id = uuidv4();
        const ref = idRef(id);
        const item: DashboardItemDefinition = {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default,
                    gridWidth: RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
                },
            },
            widget: {
                type: "richText",
                description: "",
                content: "",
                drills: [],
                ignoreDashboardFilters: [],
                title: "",
                identifier: id,
                ref,
                uri: `/${id}`,
            },
        };
        void addItemAtEndOfLayout(dispatch, layout, item, ref);
    }, [dispatch, layout, closeInsightPicker]);

    const handleFilterActivate = useCallback(() => {
        closeInsightPicker();
        dispatch(uiActions.selectFilterIndex(filterContextFilters.length));
    }, [dispatch, filterContextFilters.length, closeInsightPicker]);

    return (
        <>
            {isInsightPickerOpen ? (
                <InsightPickerPanel onClose={closeInsightPicker} {...pickerState} />
            ) : null}
            <div className="gd-floating-toolbar s-floating-toolbar">
                <div
                    className={cx(
                        "gd-floating-toolbar__button",
                        "gd-floating-toolbar__button--primary",
                        "s-floating-toolbar-insight-picker",
                        { "is-selected": isInsightPickerOpen },
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={toggleInsightPicker}
                    onKeyDown={(e) => {
                        if (isActionKey(e)) {
                            e.preventDefault();
                            toggleInsightPicker();
                        }
                    }}
                >
                    <IconInsightPicker
                        color={isInsightPickerOpen ? primaryColor : iconColor}
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                    />
                    <span className="gd-floating-toolbar__button-label">
                        {intl.formatMessage({ id: "addPanel.savedVisualizations" })}
                    </span>
                </div>
                <DraggableToolbarButton
                    icon={<IconInsight color={iconColor} width={ICON_SIZE} height={ICON_SIZE} />}
                    label={intl.formatMessage({ id: "addPanel.newVisualization" })}
                    dragItem={INSIGHT_PLACEHOLDER_DRAG_ITEM}
                    testSelector="s-floating-toolbar-new-visualization"
                    onMouseDown={closeInsightPicker}
                    onActivate={handleInsightPlaceholderActivate}
                />
                <DraggableToolbarButton
                    icon={<IconColumnContainer color={iconColor} width={ICON_SIZE} height={ICON_SIZE} />}
                    label={intl.formatMessage({ id: "addPanel.dashboardLayout" })}
                    dragItem={DASHBOARD_LAYOUT_DRAG_ITEM}
                    testSelector="s-floating-toolbar-dashboard-layout"
                    onMouseDown={closeInsightPicker}
                    onActivate={handleDashboardLayoutActivate}
                />
                {enableVisualizationSwitcher ? (
                    <DraggableToolbarButton
                        icon={
                            <IconVisualizationSwitcher
                                color={iconColor}
                                width={ICON_SIZE}
                                height={ICON_SIZE}
                            />
                        }
                        label={intl.formatMessage({ id: "addPanel.visualizationSwitcher" })}
                        dragItem={VIS_SWITCHER_DRAG_ITEM}
                        testSelector="s-floating-toolbar-visualization-switcher"
                        onMouseDown={closeInsightPicker}
                        onActivate={handleVisSwitcherActivate}
                    />
                ) : null}
                {supportsRichText && enableRichText ? (
                    <DraggableToolbarButton
                        icon={<IconRichText color={iconColor} width={ICON_SIZE} height={ICON_SIZE} />}
                        label={intl.formatMessage({ id: "addPanel.richTextWidget" })}
                        dragItem={RICH_TEXT_DRAG_ITEM}
                        testSelector="s-floating-toolbar-rich-text"
                        onMouseDown={closeInsightPicker}
                        onActivate={handleRichTextActivate}
                    />
                ) : null}
                <DraggableToolbarButton
                    icon={<IconAttributeFilter color={iconColor} width={ICON_SIZE} height={ICON_SIZE} />}
                    label={intl.formatMessage({ id: "addPanel.dashboardFilter" })}
                    dragItem={ATTRIBUTE_FILTER_DRAG_ITEM}
                    testSelector="s-floating-toolbar-attribute-filter"
                    onMouseDown={closeInsightPicker}
                    onActivate={handleFilterActivate}
                />
            </div>
        </>
    );
}
