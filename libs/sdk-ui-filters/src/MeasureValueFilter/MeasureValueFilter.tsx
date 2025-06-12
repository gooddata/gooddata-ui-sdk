// (C) 2020-2022 GoodData Corporation
import React from "react";
import { IMeasureValueFilter } from "@gooddata/sdk-model";
import noop from "lodash/noop.js";

import { MeasureValueFilterDropdown } from "./MeasureValueFilterDropdown.js";
import MeasureValueFilterButton from "./MeasureValueFilterButton.js";
import { IMeasureValueFilterCommonProps } from "./typings.js";

/**
 * @beta
 */
export interface IMeasureValueFilterProps extends IMeasureValueFilterCommonProps {
    buttonTitle: string;
    onCancel?: () => void;
}

/**
 * @beta
 */
export interface IMeasureValueFilterState {
    displayDropdown: boolean;
}

/**
 * @beta
 */
export class MeasureValueFilter extends React.PureComponent<
    IMeasureValueFilterProps,
    IMeasureValueFilterState
> {
    public static defaultProps: Partial<IMeasureValueFilterProps> = {
        onCancel: noop,
    };

    public state: IMeasureValueFilterState = {
        displayDropdown: false,
    };

    private buttonRef = React.createRef<HTMLDivElement>();

    public render() {
        const { displayDropdown } = this.state;
        const {
            filter,
            measureIdentifier,
            buttonTitle,
            usePercentage,
            warningMessage,
            locale,
            separators,
            displayTreatNullAsZeroOption,
            treatNullAsZeroDefaultValue,
            enableOperatorSelection,
        } = this.props;

        return (
            <React.Fragment>
                <div ref={this.buttonRef}>
                    <MeasureValueFilterButton
                        onClick={this.toggleDropdown}
                        isActive={displayDropdown}
                        buttonTitle={buttonTitle}
                    />
                </div>
                {displayDropdown ? (
                    <MeasureValueFilterDropdown
                        onApply={this.onApply}
                        onCancel={this.onCancel}
                        filter={filter}
                        measureIdentifier={measureIdentifier}
                        usePercentage={usePercentage}
                        warningMessage={warningMessage}
                        locale={locale}
                        separators={separators}
                        displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                        treatNullAsZeroDefaultValue={treatNullAsZeroDefaultValue}
                        enableOperatorSelection={enableOperatorSelection}
                        anchorEl={this.buttonRef.current}
                    />
                ) : null}
            </React.Fragment>
        );
    }

    private onApply = (filter: IMeasureValueFilter) => {
        this.closeDropdown();
        this.props.onApply(filter);
    };

    private onCancel = () => {
        this.closeDropdown();
        this.props.onCancel();
    };

    private closeDropdown = () => {
        this.setState({ displayDropdown: false });
    };

    private toggleDropdown = () => {
        this.setState((state) => ({ ...state, displayDropdown: !state.displayDropdown }));
    };
}
