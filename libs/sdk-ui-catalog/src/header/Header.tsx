// (C) 2025 GoodData Corporation

import type { ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

type Props = {
    searchNode?: ReactNode;
};

export function Header({ searchNode }: Props) {
    return (
        <header className="gd-analytics-catalog__header">
            <span className="gd-analytics-catalog__header__title">
                <FormattedMessage id="analyticsCatalog.title" />
            </span>
            <UiTooltip
                anchor={<UiIcon type="question" size={16} color="complementary-6" />}
                content={<FormattedMessage id="analyticsCatalog.tooltip.content" />}
                arrowPlacement="left"
                optimalPlacement
                offset={10}
                width={300}
                triggerBy={["hover", "click"]}
            />
            <div className="gd-analytics-catalog__header__separator" />
            {searchNode}
        </header>
    );
}
