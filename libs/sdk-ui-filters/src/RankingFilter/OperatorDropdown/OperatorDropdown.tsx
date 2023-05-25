// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { RankingFilterOperator } from "@gooddata/sdk-model";
import cx from "classnames";
import { IOperatorDropdownItem } from "../types.js";
import { OperatorDropdownBody } from "./OperatorDropdownBody.js";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { messages } from "../../locales.js";

const operatorItems = [
    { value: "TOP", translationId: messages.top.id },
    { value: "BOTTOM", translationId: messages.bottom.id },
] as IOperatorDropdownItem[];

const getOperatorItemTranslation = (operator: RankingFilterOperator) => {
    return operatorItems.find(({ value }) => value === operator).translationId;
};

interface IOperatorDropdownComponentOwnProps {
    selectedValue: RankingFilterOperator;
    onSelect: (value: RankingFilterOperator) => void;
}

type OperatorDropdownComponentProps = IOperatorDropdownComponentOwnProps & WrappedComponentProps;

const OperatorDropdownComponent: React.FC<OperatorDropdownComponentProps> = ({
    selectedValue,
    onSelect,
    intl,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const onItemSelect = (value: RankingFilterOperator) => {
        onSelect(value);
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
    );

    const title = intl.formatMessage({ id: getOperatorItemTranslation(selectedValue) });

    return (
        <>
            <Button className={buttonClassNames} value={title} onClick={onButtonClick} />
            {isOpen ? (
                <OperatorDropdownBody
                    items={operatorItems}
                    selectedValue={selectedValue}
                    onSelect={onItemSelect}
                    onClose={() => setIsOpen(false)}
                />
            ) : null}
        </>
    );
};

export const OperatorDropdown = injectIntl(OperatorDropdownComponent);
