// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { type ObjRef, idRef, uriRef } from "@gooddata/sdk-model";
import {
    type IInsightPickerItem,
    type IInsightPickerMenuAction,
    InsightPicker,
    useInsightPickerState,
} from "@gooddata/sdk-ui-ext";
import { Button, Dialog } from "@gooddata/sdk-ui-kit";

import { deleteReport } from "../../actions/delete_actions.js";
import { saveReportCheck } from "../../actions/save_actions.js";
import { type IAnalyticalDesignerOpenProps } from "../../embedding/editorHeaderSlotTypes.js";
import { descriptionTooltipOpened } from "../../sagas/description_tooltip/description_tooltip_ui_actions.js";
import { isOwnershipSupported, supportsObjectUris } from "../../selectors/backend_capabilities_selector.js";
import { getUserLoginMD5, getUserUri } from "../../selectors/bootstrap_selector.js";
import { getMetadataTimeZone } from "../../selectors/feature_flag_selector.js";
import {
    canDeleteListedInsight,
    shouldLoadListedInsightPermissions,
} from "../../selectors/insight_delete_selector.js";
import { getIsReadOnlyMode } from "../../store/embedding/embedding_selectors.js";
import { type AppDispatch } from "../../store/types.js";

const authorSelector = createSelector(
    supportsObjectUris,
    getUserUri,
    getUserLoginMD5,
    (isObjectUriSupported, userUri, userLoginMd5) => {
        return isObjectUriSupported ? userUri : userLoginMd5;
    },
);

/**
 * The Open control as a button with the visualization picker in a dialog.
 */
export function InsightPickerDialog({
    workspace,
    label,
    isDisabled,
    selectedInsightId: openInsightId,
    includeTags,
    excludeTags,
    enabledVisualizationUrls,
    isSemanticSearchEnabled,
    onOpenInsight,
}: IAnalyticalDesignerOpenProps) {
    const author = useSelector(authorSelector);
    const hasOwnershipSupport = useSelector(isOwnershipSupported);
    const metadataTimeZone = useSelector(getMetadataTimeZone);
    const isReadOnly = useSelector(getIsReadOnlyMode);
    const canDeleteInsight = useSelector(canDeleteListedInsight);
    const includePermissions = useSelector(shouldLoadListedInsightPermissions);

    const dispatch = useDispatch<AppDispatch>();
    const onDeleteInsight = useCallback(
        (insightRef: ObjRef, insightTitle: string) => {
            dispatch(deleteReport(insightRef, false, { title: insightTitle }));
        },
        [dispatch],
    );
    const onSaveAsNew = useCallback(
        (saveAsNew: boolean) => {
            dispatch(saveReportCheck(saveAsNew));
        },
        [dispatch],
    );
    const onDescriptionTooltipOpened = useCallback(
        (description: string) => {
            dispatch(descriptionTooltipOpened(description));
        },
        [dispatch],
    );

    const intl = useIntl();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const pickerState = useInsightPickerState(hasOwnershipSupport ? author : undefined);
    const pendingSaveAsNew = useRef<string | null>(null);

    // When the target insight finishes loading after a "Save as new" click, trigger save-as-new.
    // If the user clicks "Save as new" on the already-open insight, we handle it
    // immediately in the onClick (openInsightId won't change, so this effect wouldn't fire).
    useEffect(() => {
        if (pendingSaveAsNew.current && pendingSaveAsNew.current === openInsightId) {
            pendingSaveAsNew.current = null;
            onSaveAsNew(true);
        }
    }, [openInsightId, onSaveAsNew]);

    const handleSelect = useCallback(
        (insightRef: ObjRef) => {
            setIsDialogOpen(false);
            onOpenInsight(insightRef);
        },
        [onOpenInsight],
    );

    const toRef = (item: IInsightPickerItem): ObjRef =>
        item.uri ? uriRef(item.uri) : idRef(item.identifier, "insight");

    const menuActions: IInsightPickerMenuAction[] = isReadOnly
        ? []
        : [
              {
                  id: "save-as-new",
                  title: intl.formatMessage({ id: "save_as_new" }),
                  onClick: (item: IInsightPickerItem) => {
                      setIsDialogOpen(false);
                      if (item.identifier === openInsightId) {
                          // Already open — trigger save-as-new immediately
                          onSaveAsNew(true);
                      } else {
                          // Different insight — open it, effect triggers save-as-new when it loads
                          pendingSaveAsNew.current = item.identifier;
                          onOpenInsight(toRef(item));
                      }
                  },
              },
              {
                  id: "delete",
                  title: intl.formatMessage({ id: "openReport.menu.delete" }),
                  isDestructive: true,
                  hasSeparator: true,
                  isAvailable: canDeleteInsight,
                  onClick: (item: IInsightPickerItem) => {
                      setIsDialogOpen(false);
                      onDeleteInsight(toRef(item), item.title);
                  },
              },
          ];

    return (
        <div className="s-report_select report-select editor-header-item">
            <Button
                className="gd-button-secondary type-metric customizable"
                value={label}
                disabled={isDisabled}
                onClick={() => setIsDialogOpen(true)}
            />
            {isDialogOpen ? (
                <Dialog
                    className="open-visualizations-dialog"
                    containerClassName="open-visualizations-dialog-container"
                    isModal={false}
                    shouldCloseOnClick={() => true}
                    onClose={() => setIsDialogOpen(false)}
                >
                    <div className="adi-open-visualizations s-open-visualizations">
                        <InsightPicker
                            workspace={workspace}
                            author={hasOwnershipSupport ? author : undefined}
                            includeTags={includeTags}
                            excludeTags={excludeTags}
                            enabledVisualizationClassesUrls={enabledVisualizationUrls}
                            selectedInsightId={openInsightId}
                            metadataTimeZone={metadataTimeZone}
                            enableSemanticSearch={isSemanticSearchEnabled}
                            includePermissions={includePermissions}
                            width={740}
                            {...pickerState}
                            onSelect={handleSelect}
                            onDescriptionPanelOpen={onDescriptionTooltipOpened}
                            menuActions={menuActions}
                        />
                    </div>
                </Dialog>
            ) : null}
        </div>
    );
}
