import React from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { okaidia } from 'react-syntax-highlighter/styles/prism';

export class ExampleWithSource extends React.Component {
    static propTypes = {
        source: PropTypes.string.isRequired,
        for: PropTypes.func.isRequired
    };

    constructor() {
        super();
        this.state = { hidden: true };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({ hidden: !this.state.hidden });
    }

    render() {
        const Component = this.props.for;

        return (
            <div className="example-with-source">
                <Component />
                <button className="button-link" onClick={this.toggle}>toggle source</button>
                {this.state.hidden ? '' : (
                    <SyntaxHighlighter language="jsx" style={okaidia}>{this.props.source}</SyntaxHighlighter>
                )}
            </div>
        );
    }
}

export default ExampleWithSource;
