// (C) 2019-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IntlWrapper, ISeparators } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { DropdownBody } from "./DropdownBody.js";
import { MeasureValueFilterOperator, IMeasureValueFilterValue } from "./types.js";
import { WarningMessage } from "./typings.js";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
/*
 * TODO: same thing is in sdk-ui-ext .. but filters must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

interface IDropdownOwnProps {
    onApply: (operator: string, value: IMeasureValueFilterValue, treatNullValuesAsZero: boolean) => void;
    onCancel: () => void;
    operator?: MeasureValueFilterOperator;
    value?: IMeasureValueFilterValue;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    anchorEl: HTMLElement | string;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    enableOperatorSelection?: boolean;
}

type IDropdownProps = WrappedComponentProps & IDropdownOwnProps;

interface IDropdownState {
    displayDropdown: boolean;
}

class DropdownWrapped extends React.PureComponent<IDropdownProps, IDropdownState> {
    public static defaultProps: Pick<
        IDropdownProps,
        "value" | "operator" | "displayTreatNullAsZeroOption" | "treatNullAsZeroValue"
    > = {
        value: {},
        operator: "ALL",
        displayTreatNullAsZeroOption: false,
        treatNullAsZeroValue: false,
    };

    public render() {
        const {
            operator,
            value,
            usePercentage,
            warningMessage,
            locale,
            onCancel,
            anchorEl,
            separators,
            displayTreatNullAsZeroOption,
            treatNullAsZeroValue,
            enableOperatorSelection,
        } = this.props;

        const selectedOperator: MeasureValueFilterOperator = operator !== null ? operator : "ALL";

        return (
            <Overlay
                alignTo={anchorEl}
                alignPoints={DROPDOWN_ALIGNMENTS}
                closeOnOutsideClick={true}
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
                onClose={onCancel}
            >
                <DropdownBody
                    operator={selectedOperator}
                    value={value}
                    usePercentage={usePercentage}
                    warningMessage={warningMessage}
                    locale={locale}
                    onCancel={onCancel}
                    onApply={this.onApply}
                    separators={separators}
                    displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
                    treatNullAsZeroValue={treatNullAsZeroValue}
                    enableOperatorSelection={enableOperatorSelection}
                />
            </Overlay>
        );
    }

    private onApply = (
        operator: MeasureValueFilterOperator | null,
        value: IMeasureValueFilterValue,
        treatNullValuesAsZero: boolean,
    ) => {
        this.props.onApply(operator, value, treatNullValuesAsZero);
    };
}

export const DropdownWithIntl = injectIntl(DropdownWrapped);

export class Dropdown extends React.PureComponent<IDropdownOwnProps, IDropdownState> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DropdownWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
