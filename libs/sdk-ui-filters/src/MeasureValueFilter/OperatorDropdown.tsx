// (C) 2007-2026 GoodData Corporation

import { memo, useState } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { useIntl } from "react-intl";

import { DropdownButton, useId } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { getOperatorIcon, getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { OperatorDropdownBody } from "./OperatorDropdownBody.js";
import { type MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownProps {
    onSelect: (operator: MeasureValueFilterOperator) => void;
    operator: MeasureValueFilterOperator;
    isDisabled?: boolean;
    isAllOperatorDisabled?: boolean;
    isMobile?: boolean;
    isViewMode?: boolean;
}

export const OperatorDropdown = memo(function OperatorDropdown(props: IOperatorDropdownProps) {
    const intl = useIntl();

    const [opened, setOpened] = useState(false);

    const id = useId();
    const buttonId = `mvf-operator-button-${id}`;
    const listboxId = `mvf-operator-listbox-${id}`;
    const labelId = `mvf-operator-label-${id}`;

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
        );

        return (
            <DropdownButton
                id={buttonId}
                title={title}
                value={title}
                className={buttonClasses}
                onClick={handleOperatorDropdownButtonClick}
                iconLeft={`gd-icon-${getOperatorIcon(operator)}`}
                disabled={isDisabled}
                isOpen={opened}
                dropdownId={listboxId}
                accessibilityConfig={{
                    // A plain button that toggles a listbox popup. Using role="button" (rather
                    // than the DropdownButton default of "combobox") avoids the WCAG 4.1.2
                    // requirement that a combobox always expose aria-controls — our listbox only
                    // exists in the DOM while open.
                    role: "button",
                    popupType: "listbox",
                    // Compose the accessible name from the visible "Condition" label and the
                    // current operator value rendered inside the button.
                    ariaLabelledBy: `${labelId} ${buttonId}`,
                }}
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
                <div className="gd-mvf-operator-dropdown-label" id={labelId}>
                    {intl.formatMessage({ id: "mvf.condition" })}
                </div>
                {renderDropdownButton()}
            </div>
            {opened ? (
                <OperatorDropdownBody
                    alignTo={`#${buttonId}`}
                    onSelect={handleOperatorSelected}
                    selectedOperator={props.operator}
                    onClose={closeOperatorDropdown}
                    listboxId={listboxId}
                    labelId={labelId}
                    isAllOperatorDisabled={props.isAllOperatorDisabled}
                    isMobile={props.isMobile}
                    isViewMode={props.isViewMode}
                />
            ) : null}
        </>
    );
});
