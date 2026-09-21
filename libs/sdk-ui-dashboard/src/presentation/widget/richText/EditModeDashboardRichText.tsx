// (C) 2020-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { widgetRef } from "@gooddata/sdk-model";
import { usePrevious } from "@gooddata/sdk-ui";
import {
    ConfirmDialog,
    IconRichText,
    OverlayController,
    OverlayControllerProvider,
    RichText,
    Typography,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { eagerRemoveSectionItemByWidgetRef } from "../../../model/commands/layout.js";
import { changeRichTextWidgetContent } from "../../../model/commands/richText.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardExecConfig } from "../../../model/react/useWidgetExecConfig.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectIsWhiteLabeled, selectSeparators } from "../../../model/store/config/configSelectors.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { selectRestrictedRichTextReferences } from "../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../presentation/constants/zIndex.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { RestrictedReferencesDialog, useHasRestrictedReferences } from "./RestrictedReferencesDialog.js";
import { type IDashboardRichTextProps } from "./types.js";
import { useEditableRichTextMenu } from "./useEditableRichTextMenu.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export function EditModeDashboardRichText({ widget, clientWidth, clientHeight }: IDashboardRichTextProps) {
    const { isSelected, hasConfigPanelOpen, closeConfigPanel } = useWidgetSelection(widgetRef(widget));
    const previousIsSelected = usePrevious(isSelected);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);
    const intl = useIntl();

    const execConfig = useDashboardExecConfig();

    const { menuItems } = useEditableRichTextMenu({ closeMenu: closeConfigPanel, widget });

    const { filters } = useRichTextWidgetFilters(widget);
    const separators = useDashboardSelector(selectSeparators);

    const dispatch = useDashboardDispatch();
    const releaseWidget = useCallback(() => dispatch(uiActions.clearWidgetSelection()), [dispatch]);

    const [richText, setRichText] = useState<string>(widget?.content);

    // the rewrite is committed at once: it was confirmed, and it is not a keystroke
    const onSanitized = useCallback(
        (sanitized: string) => {
            setRichText(sanitized);
            dispatch(changeRichTextWidgetContent(widget.ref, sanitized));
        },
        [dispatch, widget.ref],
    );

    // Selecting the widget is what opens its editor, and a text holding a reference the editor may
    // not read is asked about first. Both states are that selection and that text, so neither is
    // kept as a flag: confirming rewrites the text, which is what turns the question into the
    // editor; cancelling lets the widget go - deliberately, rather than through deselectWidgets,
    // which holds on to a widget whose text the pointer happens to have selected.
    const hasRestrictedReferences = useHasRestrictedReferences(richText);
    const isRichTextEditing = isSelected && !hasRestrictedReferences;
    const isAskingToSanitize = isSelected && hasRestrictedReferences;

    const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState(false);
    const theme = useTheme();

    const emptyContentIconColor = theme?.palette?.complementary?.c7 ?? "#6D7680";
    const EmptyElement = useMemo(() => {
        return (
            <div className="gd-rich-text-widget-empty-content">
                <IconRichText width={28} height={34} color={emptyContentIconColor} />
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
            {hasConfigPanelOpen ? (
                <RichTextMenuComponent
                    widget={widget}
                    isOpen={hasConfigPanelOpen}
                    onClose={closeConfigPanel}
                    items={menuItems}
                />
            ) : null}
            <RichText
                referencesEnabled
                filters={filters}
                separators={separators}
                restrictedReferences={restrictedReferences}
                className="gd-rich-text-widget"
                value={richText}
                onChange={setRichText}
                renderMode={isRichTextEditing ? "edit" : "view"}
                emptyElement={EmptyElement}
                LoadingComponent={LoadingComponent}
                execConfig={execConfig}
            />
            {isRichTextEditing && showLink ? (
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
                </div>
            ) : null}
            {isAskingToSanitize ? (
                <RestrictedReferencesDialog
                    value={richText}
                    onSanitized={onSanitized}
                    onCancel={releaseWidget}
                />
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
}
