// (C) 2025-2026 GoodData Corporation

import type { ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

type Props = {
    searchNode?: ReactNode;
};

export function Header({ searchNode }: Props) {
    const intl = useIntl();

    return (
        <header className="gd-analytics-catalog__header">
            <h1 className="gd-analytics-catalog__header__title">
                <FormattedMessage id="analyticsCatalog.title" />
            </h1>
            <UiTooltip
                anchor={
                    <UiIconButton
                        icon="question"
                        size="small"
                        variant="tertiary"
                        iconColor="complementary-6"
                        label={intl.formatMessage({ id: "gs.header.help" })}
                    />
                }
                content={<FormattedMessage id="analyticsCatalog.tooltip.content" />}
                arrowPlacement="left"
                optimalPlacement
                offset={10}
                width={300}
                triggerBy={["hover", "click", "focus"]}
            />
            <div className="gd-analytics-catalog__header__separator" />
            {searchNode}
        </header>
    );
}
