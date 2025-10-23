// (C) 2025 GoodData Corporation

import type { PropsWithChildren } from "react";

import type { IntlShape } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
    isEmpty: boolean;
    isLoading: boolean;
    onActionClick: () => void;
};

export function QualityScoreCardAction({ intl, isEmpty, isLoading, onActionClick }: Props) {
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
