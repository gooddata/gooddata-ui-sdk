// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import { IntlWrapper, KdaDialogController, KdaStoreProvider } from "@gooddata/sdk-ui-dashboard/internal";
import { useOverlayController } from "@gooddata/sdk-ui-kit";

import {
    keyDriverAnalysisSelector,
    settingsSelector,
    tagsSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    setKeyDriverAnalysisAction,
    setKeyDriverAnalysisMinimizedAction,
    setKeyDriverAnalysisMountedAction,
} from "../store/chatWindow/chatWindowSlice.js";
import { returnFocusToKdaTrigger } from "../utils/kdaReturnFocus.js";

const DEFAULT_LOCALE = "en-US";

/**
 * @public
 */
export type GenAiKeyDriverAnalysisProps = {
    /**
     * Locale to use for the dialog.
     */
    locale?: string;
};

/**
 * UI component that renders the Key Driver Analysis dialog when requested in the GenAI store.
 *
 * @public
 */
export function GenAiKeyDriverAnalysis({ locale }: GenAiKeyDriverAnalysisProps) {
    const parentOverlayController = useOverlayController();

    const settings = useSelector(settingsSelector);
    const tags = useSelector(tagsSelector);
    const keyDriverAnalysis = useSelector(keyDriverAnalysisSelector);

    const loc = locale ?? settings?.locale ?? DEFAULT_LOCALE;
    const separators = settings?.separators;
    const includeTags = tags?.includeTags;
    const excludeTags = tags?.excludeTags;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setKeyDriverAnalysisMountedAction({ isMounted: true }));
        return () => {
            dispatch(setKeyDriverAnalysisMountedAction({ isMounted: false }));
        };
    }, [dispatch]);

    const setKeyDriverAnalysis = useCallback(
        (...args: Parameters<typeof setKeyDriverAnalysisAction>) => {
            dispatch(setKeyDriverAnalysisAction(...args));
        },
        [dispatch],
    );

    const setKeyDriverAnalysisMinimized = useCallback(
        (...args: Parameters<typeof setKeyDriverAnalysisMinimizedAction>) => {
            dispatch(setKeyDriverAnalysisMinimizedAction(...args));
        },
        [dispatch],
    );

    const config = useMemo(
        () => ({
            objectAvailability: {
                excludeObjectsWithTags: excludeTags,
                includeObjectsWithTags: includeTags,
            },
        }),
        [excludeTags, includeTags],
    );

    const onRequestedDefinitionChange = useCallback(
        (definition?: IKdaDefinition) => {
            setKeyDriverAnalysis({ keyDriverAnalysis: definition });
        },
        [setKeyDriverAnalysis],
    );

    const onCloseKeyDriverAnalysis = useCallback(() => {
        returnFocusToKdaTrigger();
    }, []);

    const onToggleKeyDriverAnalysis = useCallback(
        (minimized: boolean) => {
            setKeyDriverAnalysisMinimized({ minimized });
        },
        [setKeyDriverAnalysisMinimized],
    );

    if (!keyDriverAnalysis) {
        return null;
    }

    return (
        <IntlWrapper locale={loc}>
            <KdaStoreProvider config={config}>
                <KdaDialogController
                    requestedDefinition={keyDriverAnalysis}
                    parentOverlayController={parentOverlayController}
                    separators={separators}
                    showCloseButton
                    locale={loc}
                    includeTags={includeTags}
                    excludeTags={excludeTags}
                    onRequestedDefinitionChange={onRequestedDefinitionChange}
                    onClose={onCloseKeyDriverAnalysis}
                    onToggle={onToggleKeyDriverAnalysis}
                />
            </KdaStoreProvider>
        </IntlWrapper>
    );
}
