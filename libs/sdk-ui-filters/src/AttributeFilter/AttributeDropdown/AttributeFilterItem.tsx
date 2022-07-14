// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase";
export interface ISource {
    title?: string;
    uri?: string;
    empty?: boolean;
}

export interface IAttributeElement {
    selected?: boolean;
    source: ISource;
    onSelect?: (source: ISource) => void;
}

export interface IAttributeFilterItemProps {
    item?: IAttributeElement;
}

export class AttributeFilterItem extends React.PureComponent<IAttributeFilterItemProps> {
    public render() {
        const { item } = this.props;

        if (!item || item.source.empty) {
            return this.renderLoadingItem();
        }

        const classes = cx(
            "gd-list-item",
            "s-attribute-filter-list-item",
            `s-attribute-filter-list-item-${camelCase(item.source.title)}`,
            {
                "s-attribute-filter-list-item-selected": item.selected,
            },
        );
        return (
            <div className={classes} onClick={this.handleSelect}>
                <input
                    type="checkbox"
                    className="gd-input-checkbox"
                    readOnly={true}
                    checked={item.selected}
                />
                <span>{item.source.title}</span>
            </div>
        );
    }

    private renderLoadingItem() {
        return <div className="gd-list-item gd-list-item-not-loaded" />;
    }

    private handleSelect = () => {
        const { item } = this.props;

        item.onSelect(item.source);
    };
}
