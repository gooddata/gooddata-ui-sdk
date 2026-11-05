// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

import { IconEmbedCode } from "@gooddata/sdk-ui-kit";

import { createEmbedDialogOpenAction } from "../../../actions/embed_dialog_actions.js";
import {
    type IAnalyticalDesignerEmbedProps,
    type IAnalyticalDesignerHeaderContext,
} from "../../../embedding/editorHeaderSlotTypes.js";
import { documentationUrl as documentationUrlSelector } from "../../../selectors/bootstrap_selector.js";
import { isReportExecutableSelector } from "../../../selectors/report_selector.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";
import { useGuardedCallback } from "../editorHeaderContext.js";

import { getEmbedAnalyticalDesignerLink } from "./documentationLinks.js";
import { EmbedMenu } from "./EmbedMenu.js";

const isReportBlankSelector = createSelector(isReportExecutableSelector, (isExecutable) => !isExecutable);

const canEmbed = (state: IAppState) => !isReportBlankSelector(state);
const runEmbed = (dispatch: AppDispatch) => dispatch(createEmbedDialogOpenAction());

export function useEmbedProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerEmbedProps {
    const intl = useIntl();
    const isReportBlank = useSelector(isReportBlankSelector);
    const documentationUrl = useSelector(documentationUrlSelector);
    const onEmbedInsight = useGuardedCallback(canEmbed, runEmbed);

    const label = intl.formatMessage({ id: "embedInsightDialog.embed.button.label" });
    const embedInsightLabel = intl.formatMessage({ id: "embedInsightDialog.embed.menu.title" });
    const disabledReason = intl.formatMessage({
        id: "embedInsightDialog.embed.disable.message.empty.report",
    });
    const documentationLabel = intl.formatMessage({
        id: "embedInsightDialog.embed.analytical.designer.menu.title",
    });

    return useMemo(
        () => ({
            ...context,
            label,
            embedInsightLabel,
            isEmbedInsightDisabled: isReportBlank,
            ...(isReportBlank ? { embedInsightDisabledReason: disabledReason } : {}),
            documentationLabel,
            // the props are built even while Embed is hidden, where the bootstrap may carry no documentation
            documentationUrl: documentationUrl ? getEmbedAnalyticalDesignerLink(documentationUrl) : "",
            onEmbedInsight,
        }),
        [
            context,
            label,
            embedInsightLabel,
            isReportBlank,
            disabledReason,
            documentationLabel,
            documentationUrl,
            onEmbedInsight,
        ],
    );
}

/**
 * Default of the Embed slot: an icon button with a menu of the embedding choices.
 */
export function DefaultEmbed({
    label,
    embedInsightLabel,
    isEmbedInsightDisabled,
    embedInsightDisabledReason,
    documentationLabel,
    documentationUrl,
    onEmbedInsight,
}: IAnalyticalDesignerEmbedProps) {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setMenuOpen((open) => !open);
    }, []);

    const onMenuClick = useCallback(() => {
        setMenuOpen(false);
        onEmbedInsight();
    }, [onEmbedInsight]);

    return (
        <>
            <button
                style={{ height: 32 }}
                data-testid="s-embed-button"
                className="gd-button-secondary editor-header-item"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
            >
                <IconEmbedCode />
            </button>
            {isMenuOpen ? (
                <EmbedMenu
                    embedInsightLabel={embedInsightLabel}
                    isEmbedInsightDisabled={isEmbedInsightDisabled}
                    embedInsightDisabledReason={embedInsightDisabledReason}
                    documentationLabel={documentationLabel}
                    documentationUrl={documentationUrl}
                    toggleMenu={toggleMenu}
                    onMenuItemClick={onMenuClick}
                />
            ) : null}
        </>
    );
}
