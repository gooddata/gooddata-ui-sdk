// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { type ILocale, fillMissingTitlesWithMessages } from "@gooddata/sdk-ui";
import { EmbedInsightDialog } from "@gooddata/sdk-ui-ext";
import { type CopyCodeOriginType, type EmbedType, IconEmbedCode } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { hideDialog } from "../../../actions/dialogs_actions.js";
import {
    createEmbedDialogCopyCodeAction,
    createEmbedDialogOpenAction,
} from "../../../actions/embed_dialog_actions.js";
import { saveReportCheck } from "../../../actions/save_actions.js";
import { backend } from "../../../backend.js";
import {
    documentationUrl as documentationUrlSelector,
    getProjectId,
} from "../../../selectors/bootstrap_selector.js";
import { getExecutionConfig } from "../../../selectors/execution_config_selector.js";
import { getFeatureFlags } from "../../../selectors/feature_flag_selector.js";
import { getInsightForSaveViaMd } from "../../../selectors/insight_selectors.js";
import { getIntlMessagesForLocale } from "../../../selectors/intl_selector.js";
import { isReportExecutableSelector } from "../../../selectors/report_selector.js";
import { getColorPalette } from "../../../store/app_context/app_context_selectors.js";
import { getShowEmbedInsightDialog } from "../../../store/dialogs/dialogs_selectors.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";

import { getEmbedAnalyticalDesignerLink, getIntegrationLink } from "./documentationLinks.js";
import { EmbedMenu } from "./EmbedMenu.js";
import { isCodeGenerationSupported } from "./utils.js";

const isReportBlankSelector = createSelector(isReportExecutableSelector, (isExecutable) => !isExecutable);

export function EmbedButton() {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const intl = useIntl();
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const isReportBlank = useSelector((state: IAppState) => isReportBlankSelector(state));
    const insight = useSelector((state: IAppState) => getInsightForSaveViaMd(state));
    const settings = useSelector((state: IAppState) => getFeatureFlags(state));
    const colorPalette = useSelector((state: IAppState) => getColorPalette(state));
    const documentationUrl = useSelector((state: IAppState) => documentationUrlSelector(state));
    const executionConfig = useSelector((state: IAppState) => getExecutionConfig(state));
    const workspaceId = useSelector((state: IAppState) => getProjectId(state));
    const isEmbedDialogVisible = useSelector((state: IAppState) => getShowEmbedInsightDialog(state));
    const messages = useSelector((state: IAppState) => getIntlMessagesForLocale(state));

    const toggleMenu = useCallback(() => {
        setMenuOpen((open) => !open);
    }, []);

    const onMenuClick = useCallback(() => {
        setMenuOpen(false);
        dispatch(createEmbedDialogOpenAction());
    }, [dispatch]);

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

    const isGenerationSupported = useMemo(() => {
        return isCodeGenerationSupported(insight, settings);
    }, [insight, settings]);

    // we need to do the same transformations as when the insight is executed by the AD itself (see PluggableVisualization.tsx)
    const effectiveInsight = fillMissingTitlesWithMessages(
        insight,
        settings.locale as ILocale,
        messages,
        undefined,
    );

    return (
        <>
            <button
                style={{ height: 32 }}
                data-testid="s-embed-button"
                className="gd-button-secondary editor-header-item"
                onClick={toggleMenu}
            >
                <IconEmbedCode />
            </button>
            {isMenuOpen ? (
                <EmbedMenu
                    isReportBlank={isReportBlank}
                    isCodeGenerationSupported={isGenerationSupported}
                    embedAnalyticalDesignerLink={getEmbedAnalyticalDesignerLink(documentationUrl)}
                    toggleMenu={toggleMenu}
                    onMenuItemClick={onMenuClick}
                />
            ) : null}
            {isEmbedDialogVisible ? (
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
            ) : null}
        </>
    );
}
