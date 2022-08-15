// (C) 2007-2022 GoodData Corporation
import React, { PureComponent } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface IMultiSelectListItemProps {
    title?: string;
    isSelected?: boolean;
    onMouseOut?: () => void;
    onMouseOver?: () => void;
    onOnly?: () => void;
    onClick?: () => void;
}

/**
 * @internal
 */
export class MultiSelectListItem extends PureComponent<IMultiSelectListItemProps> {
    public render(): JSX.Element {
        const { title, onClick, onMouseOver, onMouseOut, isSelected } = this.props;

        return (
            <div
                className={this.getClassNames()}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox" readOnly={true} checked={isSelected} />
                    <span className="input-label-text">{title}</span>
                </label>
                {this.renderOnly()}
            </div>
        );
    }

    private getClassNames = () => {
        const { title, isSelected } = this.props;
        return cx({
            "gd-list-item": true,
            [`s-${stringUtils.simplifyText(title)}`]: true,
            "has-only-visible": true,
            "is-selected": isSelected,
        });
    };

    private renderOnly = () => {
        const { onOnly } = this.props;
        return (
            <span
                className="gd-list-item-only"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onOnly) {
                        onOnly();
                    }
                }}
            >
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    };
}
