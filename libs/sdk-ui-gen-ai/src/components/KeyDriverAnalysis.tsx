// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { type ISeparators } from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import { IntlWrapper, KdaDialogController, KdaStoreProvider } from "@gooddata/sdk-ui-dashboard/internal";

import {
    keyDriverAnalysisSelector,
    settingsSelector,
    tagsSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import { type RootState, setKeyDriverAnalysisAction } from "../store/index.js";

interface IKeyDriverAnalysisProps {
    keyDriverAnalysis?: IKdaDefinition;
    separators?: ISeparators;
    locale?: string;
    includeTags?: string[];
    excludeTags?: string[];
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
}

function KeyDriverAnalysisComponent(props: IKeyDriverAnalysisProps) {
    const { keyDriverAnalysis, separators, locale, includeTags, excludeTags, setKeyDriverAnalysis } = props;
    const intl = useIntl();

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
            setKeyDriverAnalysis?.({ keyDriverAnalysis: definition });
        },
        [setKeyDriverAnalysis],
    );

    if (!keyDriverAnalysis) {
        return null;
    }

    return (
        <IntlWrapper locale={locale ?? intl.locale}>
            <KdaStoreProvider config={config}>
                <KdaDialogController
                    requestedDefinition={keyDriverAnalysis}
                    separators={separators}
                    showCloseButton
                    locale={locale ?? intl.locale}
                    includeTags={includeTags}
                    excludeTags={excludeTags}
                    onRequestedDefinitionChange={onRequestedDefinitionChange}
                />
            </KdaStoreProvider>
        </IntlWrapper>
    );
}

const mapDispatchToProps: IKeyDriverAnalysisProps = {
    setKeyDriverAnalysis: setKeyDriverAnalysisAction,
};

const mapStateToProps = (state: RootState): IKeyDriverAnalysisProps => {
    const settings = settingsSelector(state);
    const tags = tagsSelector(state);
    return {
        keyDriverAnalysis: keyDriverAnalysisSelector(state),
        locale: settings?.locale,
        separators: settings?.separators,
        includeTags: tags?.includeTags,
        excludeTags: tags?.excludeTags,
    };
};

export const KeyDriverAnalysis: any = connect(
    mapStateToProps,
    mapDispatchToProps,
)(KeyDriverAnalysisComponent);
