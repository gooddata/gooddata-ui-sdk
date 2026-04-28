// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import type { PropsWithChildren } from "react";
import type { IntlShape } from "react-intl";

import { UiButton, UiTooltip } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
    isEmpty: boolean;
    isLoading: boolean;
    isSyncing: boolean;
    isError: boolean;
    onActionClick: () => void;
};

export function QualityScoreCardAction({
    intl,
    isEmpty,
    isLoading,
    isSyncing,
    onActionClick,
    isError,
}: Props) {
    if (isError) {
        return <div></div>;
    }
    if (isSyncing) {
        return (
            <Layout fullWidth>
                <UiTooltip
                    anchorWrapperStyles={{
                        display: "inline",
                    }}
                    optimalPlacement
                    arrowPlacement="top"
                    triggerBy={["hover", "focus"]}
                    anchor={
                        <span tabIndex={0}>
                            {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.syncing" })}
                        </span>
                    }
                    content={intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.action.syncing" })}
                />
            </Layout>
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

function Layout({ children, fullWidth }: PropsWithChildren<{ fullWidth?: boolean }>) {
    return (
        <div
            className={cx("gd-analytics-catalog__quality-score-card__action", {
                "quality-score-card__fullWidth": fullWidth,
            })}
        >
            {children}
        </div>
    );
}
