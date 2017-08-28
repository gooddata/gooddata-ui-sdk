import * as React from 'react';
import { connect } from 'react-redux';
import { Afm } from '@gooddata/data-layer';
import { changeFilter } from './redux/actionCreators';

const { PropTypes } = React;

export interface IFilterPublisherProps {
    onApply(filter: Afm.IFilter): void;
    children?: any;
}

export class PureFilterPublisher extends React.PureComponent<IFilterPublisherProps,null> {
    static propTypes = {
        onApply: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired
    };

    render() {
        const { onApply } = this.props;
        const childrenProps = {
            onApply
        };

        // tslint:disable-next-line:max-line-length
        // https://stackoverflow.com/questions/42261783/how-to-assign-the-correct-typing-to-react-cloneelement-when-giving-properties-to
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

export const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onApply: (filter) => {
            return dispatch(changeFilter(ownProps.id, filter));
        }
    };
};


export const FilterPublisher = connect(null, mapDispatchToProps)(PureFilterPublisher);
