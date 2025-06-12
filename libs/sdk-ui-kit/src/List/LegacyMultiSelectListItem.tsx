// (C) 2007-2021 GoodData Corporation
import React, { PureComponent } from "react";
import { FormattedMessage, injectIntl, IntlShape } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface ILegacyMultiSelectListItemProps {
    intl: IntlShape;
    isLoading?: boolean;
    onMouseOut?: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onOnly?: (source: any) => void;
    onSelect?: (source: any) => void;
    selected?: boolean;
    source?: any;
}

/**
 * @internal
 * @deprecated This component is deprecated use MultiSelectListItem instead
 */
export class LegacyMultiSelectListItem extends PureComponent<ILegacyMultiSelectListItemProps> {
    static defaultProps = {
        isLoading: false,
        onMouseOver: noop,
        onMouseOut: noop,
        onOnly: noop,
        onSelect: noop,
        selected: false,
        source: {},
    };

    constructor(props: ILegacyMultiSelectListItemProps) {
        super(props);

        this.handleSelect = this.handleSelect.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleOnly = this.handleOnly.bind(this);
    }

    protected getClassNames(): string {
        return cx({
            "gd-list-item": true,
            [`s-${stringUtils.simplifyText(this.props.source.title)}`]: true,
            "has-only-visible": true,
            "is-selected": this.props.selected,
        });
    }

    protected handleSelect = (): void => {
        this.props.onSelect(this.props.source);
    };

    protected handleMouseOver = (): void => {
        this.props.onMouseOver(this.props.source);
    };

    protected handleMouseOut = (): void => {
        this.props.onMouseOut(this.props.source);
    };

    private handleOnly = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        this.props.onOnly(this.props.source);
    };

    protected renderOnly(): JSX.Element {
        return (
            <span className="gd-list-item-only" onClick={this.handleOnly}>
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    }

    render(): JSX.Element {
        return (
            <div
                className={this.getClassNames()}
                onClick={this.handleSelect}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            >
                <label className="input-checkbox-label">
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        readOnly
                        checked={this.props.selected}
                    />
                    <span className="input-label-text">{this.props.source.title}</span>
                </label>
                {this.renderOnly()}
            </div>
        );
    }
}

export default injectIntl(LegacyMultiSelectListItem);
