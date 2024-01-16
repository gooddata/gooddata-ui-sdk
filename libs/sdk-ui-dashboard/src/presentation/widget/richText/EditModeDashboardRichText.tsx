// (C) 2020-2024 GoodData Corporation
import React, { useEffect, useMemo, useState } from "react";
import {
    changeRichTextWidgetContent,
    eagerRemoveSectionItemByWidgetRef,
    uiActions,
    useDashboardDispatch,
    useWidgetSelection,
} from "../../../model/index.js";
import { IDashboardRichTextProps } from "./types.js";
import { widgetRef } from "@gooddata/sdk-model";
import { RichText } from "./RichText.js";
import {
    Button,
    ConfirmDialog,
    Icon,
    OverlayController,
    OverlayControllerProvider,
    Typography,
} from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { usePrevious } from "@gooddata/sdk-ui";
import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../presentation/constants/index.js";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export const EditModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({ widget }) => {
    const { isSelected } = useWidgetSelection(widgetRef(widget));
    const previousIsSelected = usePrevious(isSelected);
    const intl = useIntl();

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
                <Typography tagName="p">
                    <FormattedMessage id="richText.emptyContent" />
                </Typography>
            </div>
        );
    }, [emptyContentIconColor]);

    useEffect(() => {
        setIsRichTextEditing(isSelected);
    }, [isSelected]);

    useEffect(() => {
        // Deselect widget and commit updated markdown text "on blur"
        if (previousIsSelected === true && isSelected === false && richText !== widget?.content) {
            dispatch(changeRichTextWidgetContent(widget.ref, richText));
        }
    }, [richText, widget?.content, widget.ref, dispatch, isSelected, previousIsSelected]);

    return (
        <>
            <RichText
                text={richText}
                onChange={setRichText}
                editMode={isRichTextEditing}
                emptyElement={EmptyElement}
            />
            {isRichTextEditing ? (
                <div className="gd-rich-text-footer">
                    <div className="gd-rich-text-footer-options">
                        <div className="gd-hider-div" />
                        <a
                            className="gd-button-link-dimmed gd-icon-circle-question"
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/rich-text/"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <FormattedMessage id="richText.formattingOptions" />
                        </a>
                    </div>
                    <div className="gd-rich-text-footer-actions">
                        <Button
                            className="gd-button-link gd-button-icon-only gd-icon-trash"
                            onClick={() => setIsConfirmDeleteDialogVisible(true)}
                        />
                        <span className="gd-divider" />
                        <Button
                            className="gd-button-link gd-button-icon-only gd-icon-checkmark"
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(uiActions.clearWidgetSelection());
                                dispatch(changeRichTextWidgetContent(widget.ref, richText));
                            }}
                        />
                    </div>
                </div>
            ) : null}
            {isConfirmDeleteDialogVisible ? (
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialog
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
