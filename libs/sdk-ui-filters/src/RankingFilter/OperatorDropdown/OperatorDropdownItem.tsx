// (C) 2020-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { type RankingFilterOperator } from "@gooddata/sdk-model";
import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

interface IOperatorDropdownItemProps {
    title: string;
    value: RankingFilterOperator;
    strictLimitOfRows: boolean;
    isSelected: boolean;
    tooltipId?: string;
    /** Current ranking filter value (N); fills the {n} placeholder in the strict condition tooltip. */
    limitValue: number;
    onSelect: (value: RankingFilterOperator, strictLimitOfRows: boolean) => void;
}

export function OperatorDropdownItem({
    title,
    value,
    strictLimitOfRows,
    isSelected,
    tooltipId,
    limitValue,
    onSelect,
}: IOperatorDropdownItemProps) {
    const intl = useIntl();

    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
        },
        "gd-button-link",
        `s-rf-operator-${simplifyText(title)}`,
    );

    return (
        <button className={className} onClick={() => onSelect(value, strictLimitOfRows)}>
            <span>{title}</span>
            {tooltipId ? (
                <span className="gd-rf-operator-tooltip s-rf-operator-tooltip">
                    <UiTooltip
                        triggerBy={["hover", "focus"]}
                        hoverOpenDelay={0}
                        hoverCloseDelay={0}
                        arrowPlacement="left"
                        optimalPlacement
                        width={200}
                        anchor={
                            <span className="gd-rf-operator-tooltip-icon s-rf-operator-tooltip-icon">
                                <UiIcon type="question" size={14} color="currentColor" layout="block" />
                            </span>
                        }
                        content={intl.formatMessage({ id: tooltipId }, { n: limitValue })}
                    />
                </span>
            ) : null}
        </button>
    );
}
