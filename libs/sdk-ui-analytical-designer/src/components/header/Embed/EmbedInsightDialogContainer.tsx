// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ILocale, fillMissingTitlesWithMessages } from "@gooddata/sdk-ui";
import { EmbedInsightDialog } from "@gooddata/sdk-ui-ext";
import { type CopyCodeOriginType, type EmbedType } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { hideDialog } from "../../../actions/dialogs_actions.js";
import { createEmbedDialogCopyCodeAction } from "../../../actions/embed_dialog_actions.js";
import { saveReportCheck } from "../../../actions/save_actions.js";
import { backend } from "../../../backend.js";
import { getProjectId } from "../../../selectors/bootstrap_selector.js";
import { getExecutionConfig } from "../../../selectors/execution_config_selector.js";
import { getFeatureFlags } from "../../../selectors/feature_flag_selector.js";
import { getInsightForSaveViaMd } from "../../../selectors/insight_selectors.js";
import { getIntlMessagesForLocale } from "../../../selectors/intl_selector.js";
import { getColorPalette } from "../../../store/app_context/app_context_selectors.js";
import { getShowEmbedInsightDialog } from "../../../store/dialogs/dialogs_selectors.js";
import { type AppDispatch } from "../../../store/types.js";

import { getIntegrationLink } from "./documentationLinks.js";

/**
 * The embed code dialog. It belongs to the embed flow, not to the Embed control, so it opens for a host's
 * own Embed control too.
 */
export function EmbedInsightDialogContainer() {
    const isEmbedDialogVisible = useSelector(getShowEmbedInsightDialog);
    return isEmbedDialogVisible ? <EmbedInsightDialogContent /> : null;
}

function EmbedInsightDialogContent() {
    const intl = useIntl();
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const insight = useSelector(getInsightForSaveViaMd);
    const settings = useSelector(getFeatureFlags);
    const colorPalette = useSelector(getColorPalette);
    const executionConfig = useSelector(getExecutionConfig);
    const workspaceId = useSelector(getProjectId);
    const messages = useSelector(getIntlMessagesForLocale);

    const onDialogClose = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const onCopyCode = useCallback(
        (code: string, type: CopyCodeOriginType, codeType: EmbedType) => {
            dispatch(createEmbedDialogCopyCodeAction(code, type, codeType));
        },
        [dispatch],
    );

    const openSaveInsightClick = useCallback(() => {
        onDialogClose();
        dispatch(saveReportCheck(false, false, true));
    }, [dispatch, onDialogClose]);

    // we need to do the same transformations as when the insight is executed by the AD itself (see PluggableVisualization.tsx)
    const effectiveInsight = useMemo(
        () => fillMissingTitlesWithMessages(insight, settings.locale as ILocale, messages, undefined),
        [insight, settings.locale, messages],
    );

    return (
        <EmbedInsightDialog
            insight={effectiveInsight}
            settings={settings}
            backend={backend}
            locale={intl.locale}
            theme={theme}
            reactIntegrationDocLink={getIntegrationLink()}
            webComponentIntegrationDocLink={getIntegrationLink()}
            colorPalette={colorPalette}
            executionConfig={executionConfig}
            onClose={onDialogClose}
            onCopyCode={onCopyCode}
            workspaceId={workspaceId}
            openSaveInsightDialog={openSaveInsightClick}
            showWebComponentsTab
        />
    );
}
