// (C) 2020-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { type RankingFilterOperator } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { type IOperatorDropdownItem } from "../types.js";

import { OperatorDropdownItem } from "./OperatorDropdownItem.js";

interface IOperatorDropdownBodyComponentProps {
    items: IOperatorDropdownItem[];
    selectedValue: RankingFilterOperator;
    selectedStrictLimitOfRows: boolean;
    enableRankingStrictLimit: boolean;
    onSelect: (value: RankingFilterOperator, strictLimitOfRows: boolean) => void;
    onClose: () => void;
}

export function OperatorDropdownBody({
    items,
    selectedValue,
    selectedStrictLimitOfRows,
    enableRankingStrictLimit,
    onSelect,
    onClose,
}: IOperatorDropdownBodyComponentProps) {
    const intl = useIntl();

    const bodyClassName = cx(
        "gd-dropdown",
        "overlay",
        "gd-rf-inner-overlay-dropdown",
        "gd-rf-operator-dropdown-body",
        "s-rf-operator-dropdown-body",
        {
            "gd-rf-operator-dropdown-body--strict-limit": enableRankingStrictLimit,
        },
    );

    return (
        <Overlay
            closeOnOutsideClick
            alignTo=".gd-rf-operator-dropdown-button"
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
            onClose={onClose}
        >
            <div className={bodyClassName}>
                {items.map(({ value, translationId, strictLimitOfRows = false, tooltipId }) => {
                    const title = intl.formatMessage({ id: translationId });
                    const isSelected = enableRankingStrictLimit
                        ? value === selectedValue && strictLimitOfRows === selectedStrictLimitOfRows
                        : value === selectedValue;

                    return (
                        <OperatorDropdownItem
                            key={`${value}-${strictLimitOfRows}`}
                            title={title}
                            value={value}
                            strictLimitOfRows={strictLimitOfRows}
                            isSelected={isSelected}
                            tooltipId={tooltipId}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </Overlay>
    );
}
