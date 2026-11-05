// (C) 2007-2026 GoodData Corporation

import { type Ref, useCallback, useState } from "react";

import classNames from "classnames";
import { useSelector } from "react-redux";

import { type IAnalyticalDesignerEditorHeaderProps } from "../embedding/editorHeaderSlotTypes.js";
import { renderSlot, useAdSlots } from "../embedding/slots.js";
import { enableEnhancedInsightPicker } from "../selectors/feature_flag_selector.js";

import { CatalogSidebarRestoreToggle } from "./catalogSidebar/CatalogSidebarToggle.js";
import { useEditorActions } from "./header/EditorActions.js";
import { useEditorHeaderContext } from "./header/editorHeaderContext.js";
import { EmbedInsightDialogContainer } from "./header/Embed/EmbedInsightDialogContainer.js";
import { TimezoneDialog } from "./header/TimezoneDialog.js";
import { useVisualizationInfo } from "./header/VisualizationInfo.js";

interface IEditorHeaderProps {
    /**
     * The header element, which the editor measures to place the content below it.
     */
    containerRef?: Ref<HTMLDivElement>;
}

/**
 * The header shell. It keeps the catalog restore control and the dialogs of the header flows outside the
 * EditorHeader slot, so a host that replaces or hides the header cannot strand a collapsed catalog or break a
 * flow its own controls start.
 */
export function EditorHeader({ containerRef }: IEditorHeaderProps) {
    const slots = useAdSlots();
    const context = useEditorHeaderContext();
    const isEnhancedInsightPickerEnabled = useSelector(enableEnhancedInsightPicker);

    const [isTimezoneDialogOpen, setIsTimezoneDialogOpen] = useState(false);
    const openTimezoneDialog = useCallback(() => setIsTimezoneDialogOpen(true), []);
    const closeTimezoneDialog = useCallback(() => setIsTimezoneDialogOpen(false), []);

    const visualizationInfo = useVisualizationInfo(context);
    const editorActions = useEditorActions(context, openTimezoneDialog);

    const headerProps: IAnalyticalDesignerEditorHeaderProps = {
        ...context,
        visualizationInfo,
        editorActions,
    };

    return (
        <div
            ref={containerRef}
            className={classNames("adi-editor-header", "without-dataset-picker", {
                "enhanced-insight-picker": isEnhancedInsightPickerEnabled,
                // the compact layout drops the catalog-width offset; the catalog sidebar layout positions the header
                "without-title-space": context.layout.mode === "compact",
            })}
        >
            <CatalogSidebarRestoreToggle />
            <h1 className="s-adi-application-title" />
            <div className="adi-editor-header-content">
                {renderSlot(slots.EditorHeader, DefaultEditorHeader, headerProps)}
            </div>
            <EmbedInsightDialogContainer />
            {isTimezoneDialogOpen ? <TimezoneDialog onClose={closeTimezoneDialog} /> : null}
        </div>
    );
}

/**
 * Default of the EditorHeader slot: the visualization information on the left and the actions on the right.
 */
export function DefaultEditorHeader({
    visualizationInfo,
    editorActions,
}: IAnalyticalDesignerEditorHeaderProps) {
    return (
        <div className="adi-editor-header-row">
            <div className="left-actions-wrapper">{visualizationInfo}</div>
            <div className="export-wrapper">{editorActions}</div>
        </div>
    );
}
