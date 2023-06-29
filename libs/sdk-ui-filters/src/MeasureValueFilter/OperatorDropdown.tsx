// (C) 2007-2022 GoodData Corporation
import React from "react";
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

interface IOperatorDropdownState {
    opened: boolean;
}

export class OperatorDropdown extends React.PureComponent<IOperatorDropdownProps, IOperatorDropdownState> {
    public state: IOperatorDropdownState = {
        opened: false,
    };

    public render() {
        return (
            <>
                {this.renderDropdownButton()}
                {this.state.opened ? (
                    <OperatorDropdownBody
                        alignTo={".gd-mvf-operator-dropdown-button"}
                        onSelect={this.handleOperatorSelected}
                        selectedOperator={this.props.operator}
                        onClose={this.closeOperatorDropdown}
                    />
                ) : null}
            </>
        );
    }

    private renderDropdownButton() {
        const { intl, operator, isDisabled } = this.props;
        const { opened } = this.state;

        const title = capitalize(intl.formatMessage({ id: getOperatorTranslationKey(operator) }));

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
                onClick={this.handleOperatorDropdownButtonClick}
                iconLeft={`gd-icon-${getOperatorIcon(operator)}`}
                iconRight={opened ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                disabled={isDisabled}
            />
        );
    }

    private handleOperatorSelected = (operator: MeasureValueFilterOperator) => {
        this.closeOperatorDropdown();
        this.props.onSelect(operator);
    };

    private closeOperatorDropdown = () => this.setState({ opened: false });

    private handleOperatorDropdownButtonClick = () =>
        this.setState((state) => ({ ...state, opened: !state.opened }));
}

export default injectIntl(OperatorDropdown);
