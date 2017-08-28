import * as React from 'react';
import * as classNames from 'classnames';

const PropTypes = React.PropTypes;

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

export class AttributeFilterItem extends React.PureComponent<IAttributeFilterItemProps, null> {
    static propTypes = {
        classname: PropTypes.string,
        item: PropTypes.shape({
            selected: PropTypes.bool,
            onSelect: PropTypes.func,
            source: PropTypes.shape({
                uri: PropTypes.string,
                title: PropTypes.string,
                empty: PropTypes.bool
            })
        })
    };

    static defaultProps = {
        item: null,
        classname: ''
    };

    renderLoadingItem() {
        return (
            <div className="gd-list-item gd-list-item-not-loaded" />
        );
    }

    handleSelect = () => {
        const { item } = this.props;
        item.onSelect(item.source);
    }

    render() {
        const { item } = this.props;
        
        if (!item || item.source.empty) {
            return this.renderLoadingItem();
        }

        const classes = classNames(
            'gd-list-item',
            's-attribute-filter-list-item'
        );
        return (
            <div className={classes} onClick={this.handleSelect} >
                <input
                    type="checkbox"
                    className="gd-input-checkbox"
                    readOnly
                    checked={item.selected}
                />
                <span>{item.source.title}</span>
            </div>
        );
    }
}
