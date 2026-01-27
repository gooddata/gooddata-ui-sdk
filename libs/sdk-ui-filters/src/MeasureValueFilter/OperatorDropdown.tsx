// (C) 2007-2026 GoodData Corporation

import { memo, useState } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { getOperatorIcon, getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { OperatorDropdownBody } from "./OperatorDropdownBody.js";
import { type MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownProps {
    onSelect: (operator: MeasureValueFilterOperator) => void;
    operator: MeasureValueFilterOperator;
    isDisabled?: boolean;
    isAllOperatorDisabled?: boolean;
}

export const OperatorDropdown = memo(function OperatorDropdown(props: IOperatorDropdownProps) {
    const intl = useIntl();

    const [opened, setOpened] = useState(false);

    const renderDropdownButton = () => {
        const { operator, isDisabled } = props;

        const operatorTranslationKey = getOperatorTranslationKey(operator);
        const title = capitalize(
            operatorTranslationKey === undefined
                ? operator
                : intl.formatMessage({ id: operatorTranslationKey }),
        );

        const buttonClasses = cx(
            "gd-mvf-operator-dropdown-button",
            "s-mvf-operator-dropdown-button",
            `s-mvf-operator-dropdown-button-${simplifyText(operator)}`,
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
            <div className="gd-mvf-operator-dropdown" data-testid="mvf-operator-section">
                <div className="gd-mvf-operator-dropdown-label">
                    {intl.formatMessage({ id: "mvf.condition" })}
                </div>
                {renderDropdownButton()}
            </div>
            {opened ? (
                <OperatorDropdownBody
                    alignTo={".gd-mvf-operator-dropdown-button"}
                    onSelect={handleOperatorSelected}
                    selectedOperator={props.operator}
                    onClose={closeOperatorDropdown}
                    isAllOperatorDisabled={props.isAllOperatorDisabled}
                />
            ) : null}
        </>
    );
});
