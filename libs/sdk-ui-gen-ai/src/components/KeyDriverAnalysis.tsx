// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { ISeparators } from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import { IntlWrapper, KdaDialog, KdaProvider, KdaStoreProvider } from "@gooddata/sdk-ui-dashboard/internal";

import { keyDriverAnalysisSelector, settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { RootState, setKeyDriverAnalysisAction } from "../store/index.js";

interface KeyDriverAnalysisProps {
    keyDriverAnalysis?: IKdaDefinition;
    separators?: ISeparators;
    locale?: string;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
}

function KeyDriverAnalysisComponent(props: KeyDriverAnalysisProps) {
    const { keyDriverAnalysis, separators, locale, setKeyDriverAnalysis } = props;
    const intl = useIntl();

    if (!keyDriverAnalysis) {
        return null;
    }

    return (
        <IntlWrapper locale={locale ?? intl.locale}>
            <KdaStoreProvider>
                <KdaProvider definition={keyDriverAnalysis} separators={separators}>
                    <KdaDialog
                        showCloseButton
                        locale={locale ?? intl.locale}
                        onClose={() => {
                            setKeyDriverAnalysis?.({ keyDriverAnalysis: undefined });
                        }}
                    />
                </KdaProvider>
            </KdaStoreProvider>
        </IntlWrapper>
    );
}

const mapDispatchToProps: KeyDriverAnalysisProps = {
    setKeyDriverAnalysis: setKeyDriverAnalysisAction,
};

const mapStateToProps = (state: RootState): KeyDriverAnalysisProps => {
    const settings = settingsSelector(state);
    return {
        keyDriverAnalysis: keyDriverAnalysisSelector(state),
        locale: settings?.locale,
        separators: settings?.separators,
    };
};

export const KeyDriverAnalysis: any = connect(
    mapStateToProps,
    mapDispatchToProps,
)(KeyDriverAnalysisComponent);
