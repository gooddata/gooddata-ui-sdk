import * as React from 'react';
import { connect } from 'react-redux';
import { Afm } from '@gooddata/data-layer';
import { REDUX_STATE_PATH } from './redux/filtersReducer';

const { PropTypes } = React;

export interface IFilterSubscriberProps {
    filters: Afm.IFilter[];
    children?: any;
}

export class PureFilterSubscriber extends React.PureComponent<IFilterSubscriberProps, null> {
    static propTypes = {
        filters: PropTypes.array.isRequired,
        children: PropTypes.node.isRequired
    };

    render() {
        const { filters } = this.props;
        const childrenProps = {
            filters
        };

        return (
            <div>
                {React.Children.map(this.props.children, (child: React.ReactElement<any>) => {
                    if (typeof child.type === 'string') { // div, span etc can't accept props
                        return React.cloneElement(child);
                    }
                    return React.cloneElement(child, childrenProps);
                })}
            </div>
        );
    }
}

export const mapStateToProps = (state, ownProps) => {
    return {
        filters: ownProps.ids.map(id => state[REDUX_STATE_PATH][id]).filter(f => f)
    };
};

export const FilterSubscriber = connect(mapStateToProps)(PureFilterSubscriber);
