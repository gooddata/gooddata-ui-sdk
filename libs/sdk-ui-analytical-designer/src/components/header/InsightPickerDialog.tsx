// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { type ObjRef, idRef, objRefToString, uriRef } from "@gooddata/sdk-model";
import {
    type IInsightPickerItem,
    type IInsightPickerMenuAction,
    InsightPicker,
    useInsightPickerState,
} from "@gooddata/sdk-ui-ext";
import { Button, Dialog } from "@gooddata/sdk-ui-kit";

import { deleteReport } from "../../actions/delete_actions.js";
import { openReport } from "../../actions/open_actions.js";
import { saveReportCheck } from "../../actions/save_actions.js";
import { descriptionTooltipOpened } from "../../sagas/description_tooltip/description_tooltip_ui_actions.js";
import { isOwnershipSupported, supportsObjectUris } from "../../selectors/backend_capabilities_selector.js";
import { getProjectId, getUserLoginMD5, getUserUri } from "../../selectors/bootstrap_selector.js";
import {
    enableCatalogSmartSearchResults,
    enableVisualizationFilteringByTags,
    getMetadataTimeZone,
} from "../../selectors/feature_flag_selector.js";
import { canOpenReport } from "../../selectors/open_report_selector.js";
import { openReportIdSelector } from "../../selectors/report_selector.js";
import { getTagsConfiguration } from "../../selectors/route_selector.js";
import { getEnabledVisualizationClassesUrls } from "../../services/visualization_class_service.js";
import { getIsReadOnlyMode } from "../../store/embedding/embedding_selectors.js";
import { type AppDispatch } from "../../store/types.js";

const isDisabledSelector = createSelector([canOpenReport], (canOpenReport) => !canOpenReport);

const authorSelector = createSelector(
    supportsObjectUris,
    getUserUri,
    getUserLoginMD5,
    (isObjectUriSupported, userUri, userLoginMd5) => {
        return isObjectUriSupported ? userUri : userLoginMd5;
    },
);

export function InsightPickerDialog() {
    const workspaceId = useSelector(getProjectId);
    const author = useSelector(authorSelector);
    const isDisabled = useSelector(isDisabledSelector);
    const openInsightId = useSelector(openReportIdSelector);
    const enabledVisualizationClassesUrls: string[] = useSelector(getEnabledVisualizationClassesUrls);
    const hasOwnershipSupport = useSelector(isOwnershipSupported);
    const metadataTimeZone = useSelector(getMetadataTimeZone);
    const isFilteringByTagsEnabled = useSelector(enableVisualizationFilteringByTags);
    const isReadOnly = useSelector(getIsReadOnlyMode);
    const isSmartSearchResultsEnabled = useSelector(enableCatalogSmartSearchResults);
    const tagsConfiguration = useSelector(getTagsConfiguration);

    const dispatch = useDispatch<AppDispatch>();

    const onOpenInsight = useCallback(
        (insightRef: ObjRef) => {
            dispatch(openReport(insightRef, false));
        },
        [dispatch],
    );
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
    const buttonText = intl.formatMessage({ id: "openReportPlaceholder" });

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

    const includeTags = useMemo(
        () =>
            isFilteringByTagsEnabled
                ? tagsConfiguration?.includeObjectsWithTags?.map((tag) => objRefToString(tag))
                : undefined,
        [isFilteringByTagsEnabled, tagsConfiguration?.includeObjectsWithTags],
    );
    const excludeTags = useMemo(
        () =>
            isFilteringByTagsEnabled
                ? tagsConfiguration?.excludeObjectsWithTags?.map((tag) => objRefToString(tag))
                : undefined,
        [isFilteringByTagsEnabled, tagsConfiguration?.excludeObjectsWithTags],
    );

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
                value={buttonText}
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
                    <div className="open-visualizations s-open-visualizations">
                        <InsightPicker
                            workspace={workspaceId}
                            author={hasOwnershipSupport ? author : undefined}
                            includeTags={includeTags}
                            excludeTags={excludeTags}
                            enabledVisualizationClassesUrls={enabledVisualizationClassesUrls}
                            selectedInsightId={openInsightId}
                            metadataTimeZone={metadataTimeZone}
                            enableSemanticSearch={isSmartSearchResultsEnabled}
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
