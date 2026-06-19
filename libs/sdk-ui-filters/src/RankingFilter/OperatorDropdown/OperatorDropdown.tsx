// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type RankingFilterOperator } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { messages } from "../../locales.js";
import { type IOperatorDropdownItem } from "../types.js";

import { OperatorDropdownBody } from "./OperatorDropdownBody.js";

// Two-operator variant used when the strict-limit feature is disabled (legacy behavior).
const operatorItems = [
    { value: "TOP", translationId: messages["top"].id },
    { value: "BOTTOM", translationId: messages["bottom"].id },
] as IOperatorDropdownItem[];

// Four-condition variant used when the strict-limit feature is enabled. Each operator has a strict
// variant (exactly N) and a "with ties" variant (strictLimitOfRows = false).
const strictLimitOperatorItems = [
    {
        value: "TOP",
        strictLimitOfRows: false,
        translationId: messages["top"].id,
        tooltipId: messages["withTiesTooltip"].id,
    },
    {
        value: "TOP",
        strictLimitOfRows: true,
        translationId: messages["topStrict"].id,
        tooltipId: messages["strictLimitTooltip"].id,
    },
    {
        value: "BOTTOM",
        strictLimitOfRows: false,
        translationId: messages["bottom"].id,
        tooltipId: messages["withTiesTooltip"].id,
    },
    {
        value: "BOTTOM",
        strictLimitOfRows: true,
        translationId: messages["bottomStrict"].id,
        tooltipId: messages["strictLimitTooltip"].id,
    },
] as IOperatorDropdownItem[];

const getSelectedItemTranslation = (
    items: IOperatorDropdownItem[],
    operator: RankingFilterOperator,
    strictLimitOfRows: boolean,
    enableRankingStrictLimit: boolean,
) => {
    const selected = items.find(({ value, strictLimitOfRows: itemStrict = false }) =>
        enableRankingStrictLimit
            ? value === operator && itemStrict === strictLimitOfRows
            : value === operator,
    );
    return selected?.translationId ?? "";
};

interface IOperatorDropdownComponentProps {
    selectedValue: RankingFilterOperator;
    selectedStrictLimitOfRows: boolean;
    enableRankingStrictLimit: boolean;
    /** Current ranking filter value (N), used to parametrize the condition tooltips. */
    limitValue: number;
    onSelect: (value: RankingFilterOperator, strictLimitOfRows: boolean) => void;
}

export function OperatorDropdown({
    selectedValue,
    selectedStrictLimitOfRows,
    enableRankingStrictLimit,
    limitValue,
    onSelect,
}: IOperatorDropdownComponentProps) {
    const intl = useIntl();

    const [isOpen, setIsOpen] = useState(false);

    const items = enableRankingStrictLimit ? strictLimitOperatorItems : operatorItems;

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const onItemSelect = (value: RankingFilterOperator, strictLimitOfRows: boolean) => {
        onSelect(value, strictLimitOfRows);
        setIsOpen(false);
    };

    const buttonClassNames = cx(
        "gd-button-secondary",
        "gd-button-small",
        "button-dropdown",
        "gd-icon-right",
        {
            "gd-icon-navigateup": isOpen,
            "gd-icon-navigatedown": !isOpen,
        },
        "gd-rf-operator-dropdown-button",
        "s-rf-operator-dropdown-button",
        {
            // When the strict-limit feature is on, the value tooltip icon is hidden; let the condition
            // button grow into the freed area.
            "gd-rf-operator-dropdown-button--strict-limit": enableRankingStrictLimit,
        },
    );

    const title = intl.formatMessage({
        id: getSelectedItemTranslation(
            items,
            selectedValue,
            selectedStrictLimitOfRows,
            enableRankingStrictLimit,
        ),
    });

    return (
        <>
            <Button className={buttonClassNames} value={title} onClick={onButtonClick} />
            {isOpen ? (
                <OperatorDropdownBody
                    items={items}
                    selectedValue={selectedValue}
                    selectedStrictLimitOfRows={selectedStrictLimitOfRows}
                    enableRankingStrictLimit={enableRankingStrictLimit}
                    limitValue={limitValue}
                    onSelect={onItemSelect}
                    onClose={() => setIsOpen(false)}
                />
            ) : null}
        </>
    );
}
