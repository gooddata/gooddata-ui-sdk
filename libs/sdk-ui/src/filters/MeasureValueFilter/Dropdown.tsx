// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, InjectedIntlProps } from "react-intl";
import { IntlWrapper } from "../../base/translations/IntlWrapper";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { DropdownButton as DefaultDropdownButton } from "./DropdownButton";
import { DropdownBody } from "./DropdownBody";
import { getOperatorTranslationKey } from "./helpers/measureValueFilterOperator";
import { MeasureValueFilterOperator, IValue } from "./types";

export interface IDropdownButtonProps {
    isActive?: boolean;
    onClick: (e: React.SyntheticEvent) => void;
    measureTitle?: string;
    operator?: MeasureValueFilterOperator | null;
    operatorTitle?: string;
    value?: IValue | null;
}

export interface IDropdownOwnProps {
    button?: React.ComponentType<IDropdownButtonProps>;
    onApply: (operator: MeasureValueFilterOperator | null, value: IValue) => void;
    locale?: string;
    measureTitle?: string;
    operator?: MeasureValueFilterOperator;
    value?: IValue;
    displayDropdown?: boolean;
}

export type IDropdownProps = IDropdownOwnProps & InjectedIntlProps;

interface IDropdownState {
    displayDropdown: boolean;
}

class DropdownWrapped extends React.PureComponent<IDropdownProps, IDropdownState> {
    public static defaultProps: Partial<IDropdownOwnProps> = {
        button: DefaultDropdownButton,
        value: {},
        operator: "ALL",
        displayDropdown: false,
    };

    private toggleButtonRef: EventTarget | null = null;

    constructor(props: IDropdownProps) {
        super(props);

        const { displayDropdown } = props;

        this.state = {
            displayDropdown: displayDropdown || false,
        };
    }

    public render() {
        const { intl, button, measureTitle, operator, value, locale } = this.props;
        const { displayDropdown } = this.state;
        const DropdownButton = button || DefaultDropdownButton;
        const effectiveValue = value || {};
        const selectedOperator = operator || "ALL";
        const operatorTitle = intl.formatMessage({
            id: getOperatorTranslationKey(selectedOperator),
        });

        return (
            <>
                <DropdownButton
                    isActive={displayDropdown}
                    onClick={this.toggle}
                    measureTitle={measureTitle}
                    operatorTitle={operatorTitle}
                    operator={selectedOperator}
                    value={value}
                />
                {displayDropdown ? (
                    <Overlay
                        alignTo={this.toggleButtonRef}
                        alignPoints={[{ align: "bl tl" }]}
                        closeOnOutsideClick={true}
                        closeOnParentScroll={true}
                        closeOnMouseDrag={true}
                        onClose={this.closeDropdown}
                    >
                        <DropdownBody
                            operator={selectedOperator}
                            value={effectiveValue}
                            locale={locale}
                            onCancel={this.closeDropdown}
                            onApply={this.onApply}
                        />
                    </Overlay>
                ) : null}
            </>
        );
    }

    private toggle = (e: React.SyntheticEvent) => {
        this.toggleButtonRef = !this.state.displayDropdown ? e.currentTarget : null;

        this.setState(state => ({ ...state, displayDropdown: !state.displayDropdown }));
    };

    private closeDropdown = () => {
        this.toggleButtonRef = null;
        this.setState({ displayDropdown: false });
    };

    private onApply = (operator: MeasureValueFilterOperator | null, value: IValue) => {
        this.closeDropdown();
        this.props.onApply(operator, value);
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
