// (C) 2025-2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import type { IntlShape } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
    isEmpty: boolean;
    isLoading: boolean;
    isSyncing: boolean;
    onActionClick: () => void;
};

export function QualityScoreCardAction({ intl, isEmpty, isLoading, isSyncing, onActionClick }: Props) {
    if (isSyncing) {
        return (
            <Layout>{intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.syncing" })}</Layout>
        );
    }
    if (isLoading) {
        return (
            <Layout>{intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.loading" })}</Layout>
        );
    }
    if (isEmpty) {
        return (
            <Layout>{intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.empty" })}</Layout>
        );
    }
    return (
        <Layout>
            <UiButton
                label={intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.success" })}
                variant="tertiary"
                size="small"
                onClick={onActionClick}
            />
        </Layout>
    );
}

function Layout({ children }: PropsWithChildren) {
    return <div className="gd-analytics-catalog__quality-score-card__action">{children}</div>;
}
