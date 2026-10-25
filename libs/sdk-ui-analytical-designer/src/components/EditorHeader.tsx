// (C) 2007-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { resetApplication } from "../actions/app_context_actions.js";
import { cancelEditFromKDAction } from "../actions/cancel_edit_from_kd_actions.js";
import { redo, undo } from "../actions/time_travel_actions.js";
import {
    AVAILABLE_DISPLAYED_ACTIONS,
    AVAILABLE_HIDDEN_ACTIONS,
    displayedActions as displayedActionsSelector,
    hiddenActions as hiddenActionsSelector,
    isEditorHeaderResetDisabled,
    isEmbedButtonVisible as isEmbedButtonVisibleSelector,
    isOptionsMenuEnabled as isOptionsMenuEnabledSelector,
    isRedoDisabled as isRedoDisabledSelector,
    isSaveAsVisible as isSaveAsVisibleSelector,
    isSaveVisible as isSaveVisibleSelector,
    isUndoDisabled as isUndoDisabledSelector,
} from "../selectors/editor_header_selector.js";
import { enableEnhancedInsightPicker, enableGenAiRightPanel } from "../selectors/feature_flag_selector.js";
import {
    isEditFromKD as isEditFromKDSelector,
    isExploreFromKD as isExploreFromKDSelector,
} from "../selectors/route_selector.js";
import { type AppDispatch } from "../store/types.js";

import { CatalogSidebarRestoreToggle } from "./catalogSidebar/CatalogSidebarToggle.js";
import { EmbedButton } from "./header/Embed/EmbedButton.js";
import { InsightPickerDialog } from "./header/InsightPickerDialog.js";
import { OptionsButton } from "./header/OptionsMenu/OptionsButton.js";
import { SaveAsNewReportButton } from "./header/SaveAsNewReportButton.js";
import { SaveReportButton } from "./header/SaveReportButton.js";
import { VisualizationsDropdown } from "./header/VisualizationsDropdown.js";
import { ReportTitle } from "./ReportTitle.js";

export function EditorHeader() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const isUndoDisabled = useSelector(isUndoDisabledSelector);
    const isRedoDisabled = useSelector(isRedoDisabledSelector);
    const isResetDisabled = useSelector(isEditorHeaderResetDisabled);
    const isEnhancedInsightPickerEnabled = useSelector(enableEnhancedInsightPicker);
    const isGenAiRightPanelEnabled = useSelector(enableGenAiRightPanel);
    const isOptionsMenuEnabled = useSelector(isOptionsMenuEnabledSelector);
    const isEditFromKD = useSelector(isEditFromKDSelector);
    const isExploreFromKD = useSelector(isExploreFromKDSelector);
    const hiddenActions = useSelector(hiddenActionsSelector);
    const displayedActions = useSelector(displayedActionsSelector);
    const isSaveVisible = useSelector(isSaveVisibleSelector);
    const isSaveAsVisible = useSelector(isSaveAsVisibleSelector);
    const isEmbedButtonVisible = useSelector(isEmbedButtonVisibleSelector);

    const onCancelEditFromKD = useCallback(() => {
        dispatch(cancelEditFromKDAction());
    }, [dispatch]);

    const onUndo = useCallback(() => {
        dispatch(undo());
    }, [dispatch]);

    const onRedo = useCallback(() => {
        dispatch(redo());
    }, [dispatch]);

    const onResetReport = useCallback(() => {
        dispatch(resetApplication());
    }, [dispatch]);

    const getEditorHeaderClassName = () => {
        return classNames("adi-editor-header", "without-dataset-picker", {
            "enhanced-insight-picker": isEnhancedInsightPickerEnabled,
            "without-title-space": isGenAiRightPanelEnabled,
        });
    };

    const renderSaveButtons = () => {
        return (
            <>
                {isSaveAsVisible ? <SaveAsNewReportButton /> : null}
                {isSaveVisible ? <SaveReportButton /> : null}
            </>
        );
    };

    const renderCancelButton = (): ReactElement => {
        const isFromKD = isEditFromKD || isExploreFromKD;
        const displayCancel = isFromKD || displayedActions.includes(AVAILABLE_DISPLAYED_ACTIONS.CANCEL);

        return (
            displayCancel && (
                <Button
                    value={intl.formatMessage({ id: "cancel" })}
                    className={`gd-button-secondary cancel-edit-from-kd s-cancel-edit-from-kd editor-header-item`}
                    onClick={onCancelEditFromKD}
                />
            )
        );
    };

    const renderUndoButton = (): ReactElement => {
        return (
            <span>
                <BubbleHoverTrigger>
                    <Button
                        className="gd-button-secondary gd-button-icon-only gd-icon-undo undo s-undo"
                        value=""
                        disabled={isUndoDisabled}
                        onClick={onUndo}
                    />
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "bc tc", offset: { x: 0, y: 12 } }]}
                    >
                        {intl.formatMessage({ id: "undo" })}
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        );
    };

    const renderRedoButton = (): ReactElement => {
        return (
            <span>
                <BubbleHoverTrigger>
                    <Button
                        className="gd-button-secondary gd-button-icon-only gd-icon-redo redo s-redo"
                        value=""
                        disabled={isRedoDisabled}
                        onClick={onRedo}
                    />
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "bc tc", offset: { x: 0, y: 12 } }]}
                    >
                        {intl.formatMessage({ id: "redo" })}
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        );
    };

    const renderUndoRedoButtons = (): ReactElement => {
        const isUndoRedoVisible = !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.UNDO_REDO);

        return (
            isUndoRedoVisible && (
                <div className="gd-button-group editor-header-item">
                    {renderUndoButton()}
                    {renderRedoButton()}
                </div>
            )
        );
    };

    const renderClearButton = () => {
        const isClearVisible = !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.CLEAR);
        return (
            isClearVisible && (
                <Button
                    value={intl.formatMessage({ id: "reset" })}
                    className="gd-button-secondary reset s-reset-report editor-header-item"
                    disabled={isResetDisabled}
                    onClick={onResetReport}
                />
            )
        );
    };

    const renderOpenDropdown = () => {
        const isOpenVisible = !isExploreFromKD && !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.OPEN);
        if (!isOpenVisible) {
            return null;
        }
        return isEnhancedInsightPickerEnabled ? <InsightPickerDialog /> : <VisualizationsDropdown />;
    };

    const renderOptionsButton = () => {
        return isOptionsMenuEnabled && <OptionsButton />;
    };

    const renderEmbedButton = () => {
        return isEmbedButtonVisible && <EmbedButton />;
    };

    return (
        <div className={getEditorHeaderClassName()}>
            <CatalogSidebarRestoreToggle />
            <h1 className="s-adi-application-title" />
            <div className="left-actions-wrapper">
                <ReportTitle />
            </div>
            <div className="export-wrapper">
                {renderUndoRedoButtons()}
                {renderClearButton()}
                {renderOpenDropdown()}
                {renderCancelButton()}
                {renderSaveButtons()}
                {renderEmbedButton()}
                {renderOptionsButton()}
            </div>
        </div>
    );
}
