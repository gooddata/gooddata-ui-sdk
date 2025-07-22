// (C) 2007-2025 GoodData Corporation
import React, { memo, useState } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import capitalize from "lodash/capitalize.js";
import { Button } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import OperatorDropdownBody from "./OperatorDropdownBody.js";
import { getOperatorTranslationKey, getOperatorIcon } from "./helpers/measureValueFilterOperator.js";
import { MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownOwnProps {
    onSelect: (operator: MeasureValueFilterOperator) => void;
    operator: MeasureValueFilterOperator;
    isDisabled?: boolean;
}

type IOperatorDropdownProps = IOperatorDropdownOwnProps & WrappedComponentProps;

export const OperatorDropdown = memo(function OperatorDropdown(props: IOperatorDropdownProps) {
    const [opened, setOpened] = useState(false);

    const renderDropdownButton = () => {
        const { intl, operator, isDisabled } = props;

        const operatorTranslationKey = getOperatorTranslationKey(operator);
        const title = capitalize(
            operatorTranslationKey === undefined
                ? operator
                : intl.formatMessage({ id: operatorTranslationKey }),
        );

        const buttonClasses = cx(
            "gd-mvf-operator-dropdown-button",
            "s-mvf-operator-dropdown-button",
            `s-mvf-operator-dropdown-button-${stringUtils.simplifyText(operator)}`,
            "gd-button-primary",
            "gd-button-small",
            {
                "button-dropdown": true,
                "is-dropdown-open": opened,
                "is-active": opened,
            },
        );

        return (
            <Button
                title={title}
                className={buttonClasses}
                value={title}
                onClick={handleOperatorDropdownButtonClick}
                iconLeft={`gd-icon-${getOperatorIcon(operator)}`}
                iconRight={opened ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                disabled={isDisabled}
            />
        );
    };

    const handleOperatorSelected = (operator: MeasureValueFilterOperator) => {
        closeOperatorDropdown();
        props.onSelect(operator);
    };

    const closeOperatorDropdown = () => setOpened(false);

    const handleOperatorDropdownButtonClick = () => setOpened((state) => !state);

    return (
        <>
            {renderDropdownButton()}
            {opened ? (
                <OperatorDropdownBody
                    alignTo={".gd-mvf-operator-dropdown-button"}
                    onSelect={handleOperatorSelected}
                    selectedOperator={props.operator}
                    onClose={closeOperatorDropdown}
                />
            ) : null}
        </>
    );
});

export default injectIntl(OperatorDropdown);
