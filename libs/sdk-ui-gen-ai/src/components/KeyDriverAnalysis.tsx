// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
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
} from "../store/chatWindow/chatWindowSlice.js";
import { returnFocusToKdaTrigger } from "../utils/kdaReturnFocus.js";

export function KeyDriverAnalysis() {
    const intl = useIntl();
    const parentOverlayController = useOverlayController();

    const settings = useSelector(settingsSelector);
    const tags = useSelector(tagsSelector);
    const keyDriverAnalysis = useSelector(keyDriverAnalysisSelector);

    const locale = settings?.locale;
    const separators = settings?.separators;
    const includeTags = tags?.includeTags;
    const excludeTags = tags?.excludeTags;

    const dispatch = useDispatch();

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
        <IntlWrapper locale={locale ?? intl.locale}>
            <KdaStoreProvider config={config}>
                <KdaDialogController
                    requestedDefinition={keyDriverAnalysis}
                    parentOverlayController={parentOverlayController}
                    separators={separators}
                    showCloseButton
                    locale={locale ?? intl.locale}
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
