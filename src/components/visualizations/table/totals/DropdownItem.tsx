// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import noop = require("lodash/noop");
import { injectIntl, FormattedMessage, InjectedIntlProps } from "react-intl";

export interface ITotalItem {
    title: string;
    role: string;
    type: string;
    disabled: boolean;
}

export interface IDropdownItemProps {
    item?: ITotalItem; // injected by Goodstrap List
    onSelect: (item: object) => void;
}

export class PureDropdownItem extends React.PureComponent<IDropdownItemProps & InjectedIntlProps> {
    constructor(props: IDropdownItemProps & InjectedIntlProps) {
        super(props);

        this.onSelect = this.onSelect.bind(this);
    }

    public render() {
        const { item } = this.props;

        if (item.role === "header") {
            return (
                <div className="gd-list-item gd-list-item-header indigo-totals-select-type-header">
                    <FormattedMessage id={item.title} />
                </div>
            );
        }

        const classes = classNames(
            "gd-list-item",
            "gd-list-item-shortened",
            `s-totals-select-type-item-${item.type}`,
            {
                "indigo-totals-select-type-item-disabled": item.disabled,
            },
        );

        const onClick = item.disabled ? noop : this.onSelect;

        return (
            <div className={classes} onClick={onClick}>
                {item.title}
            </div>
        );
    }

    private onSelect() {
        const { item, onSelect } = this.props;
        onSelect(item);
    }
}

export const DropdownItem = injectIntl(PureDropdownItem);
