// (C) 2020-2025 GoodData Corporation
import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { widgetRef } from "@gooddata/sdk-model";
import { usePrevious } from "@gooddata/sdk-ui";
import {
    Button,
    ConfirmDialog,
    Icon,
    OverlayController,
    OverlayControllerProvider,
    RichText,
    Typography,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../presentation/constants/index.js";
import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import {
    changeRichTextWidgetContent,
    eagerRemoveSectionItemByWidgetRef,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectIsWhiteLabeled,
    selectSeparators,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../model/index.js";

import { useEditableRichTextMenu } from "./useEditableRichTextMenu.js";
import { IDashboardRichTextProps } from "./types.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export const EditModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({
    widget,
    clientWidth,
    clientHeight,
}) => {
    const { isSelected, hasConfigPanelOpen, closeConfigPanel } = useWidgetSelection(widgetRef(widget));
    const previousIsSelected = usePrevious(isSelected);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const intl = useIntl();

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    const { menuItems } = useEditableRichTextMenu({ closeMenu: closeConfigPanel, widget });

    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters } = useRichTextFilters(widget);
    const separators = useDashboardSelector(selectSeparators);

    const dispatch = useDashboardDispatch();

    const [richText, setRichText] = useState<string>(widget?.content);

    const [isRichTextEditing, setIsRichTextEditing] = useState(true);
    const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState(false);
    const theme = useTheme();

    const emptyContentIconColor = theme?.palette?.complementary?.c7 ?? "#6D7680";
    const EmptyElement = useMemo(() => {
        return (
            <div className="gd-rich-text-widget-empty-content">
                <Icon.RichText width={28} height={34} color={emptyContentIconColor} />
                <Typography tagName="p">{intl.formatMessage({ id: "richText.emptyContent" })}</Typography>
            </div>
        );
    }, [emptyContentIconColor, intl]);

    const { RichTextMenuComponentProvider, LoadingComponent } = useDashboardComponentsContext();

    const RichTextMenuComponent = useMemo(
        () => RichTextMenuComponentProvider(widget),
        [RichTextMenuComponentProvider, widget],
    );

    useEffect(() => {
        setIsRichTextEditing(isSelected);
    }, [isSelected]);

    useEffect(() => {
        // Deselect widget and commit updated markdown text "on blur"
        if (previousIsSelected && !isSelected && richText !== widget?.content) {
            dispatch(changeRichTextWidgetContent(widget.ref, richText));
        }
    }, [richText, widget?.content, widget.ref, dispatch, isSelected, previousIsSelected]);

    const showLink =
        !isWhiteLabeled &&
        typeof clientWidth !== "undefined" &&
        clientWidth > 250 &&
        typeof clientHeight !== "undefined" &&
        clientHeight > 150;

    return (
        <>
            {hasConfigPanelOpen && isRichTextReferencesEnabled ? (
                <RichTextMenuComponent
                    widget={widget}
                    isOpen={hasConfigPanelOpen}
                    onClose={closeConfigPanel}
                    items={menuItems}
                />
            ) : null}
            <RichText
                referencesEnabled={isRichTextReferencesEnabled}
                filters={filters}
                separators={separators}
                className="gd-rich-text-widget"
                value={richText}
                onChange={setRichText}
                renderMode={isRichTextEditing ? "edit" : "view"}
                emptyElement={EmptyElement}
                LoadingComponent={LoadingComponent}
                execConfig={{
                    timestamp: executionTimestamp,
                }}
            />
            {isRichTextEditing && (showLink || !isRichTextReferencesEnabled) ? (
                <div className="gd-rich-text-widget-footer">
                    <div className="gd-rich-text-footer-options">
                        {showLink ? (
                            <a
                                className="gd-button-link-dimmed gd-icon-circle-question"
                                href="https://www.gooddata.com/docs/cloud/create-dashboards/rich-text/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FormattedMessage id="richText.formattingOptions" />
                            </a>
                        ) : null}
                    </div>
                    {!isRichTextReferencesEnabled && (
                        <div className="gd-rich-text-footer-actions">
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-trash s-rich-text-remove-button"
                                onClick={() => setIsConfirmDeleteDialogVisible(true)}
                            />
                            <span className="gd-divider" />
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-checkmark s-rich-text-confirm-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(uiActions.clearWidgetSelection());
                                    dispatch(changeRichTextWidgetContent(widget.ref, richText));
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : null}
            {isConfirmDeleteDialogVisible ? (
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialog
                        className="s-rich-text-remove-confirm-dialog"
                        onSubmit={() => dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref))}
                        onCancel={() => setIsConfirmDeleteDialogVisible(false)}
                        headline={intl.formatMessage({ id: "richText.deleteDialog.header" })}
                        submitButtonText={intl.formatMessage({ id: "delete" })}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    >
                        <FormattedMessage id="richText.deleteDialog.message" />
                    </ConfirmDialog>
                </OverlayControllerProvider>
            ) : null}
        </>
    );
};
