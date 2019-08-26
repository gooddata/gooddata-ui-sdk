// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import { okaidia } from "react-syntax-highlighter/styles/prism";

export class ExampleWithSource extends React.Component {
    static propTypes = {
        source: PropTypes.string.isRequired,
        for: PropTypes.func.isRequired,
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
        const { hidden } = this.state;
        const Component = this.props.for;

        const iconClassName = hidden ? "icon-navigatedown" : "icon-navigateup";

        return (
            <div className="example-with-source">
                <style jsx>{`
                    .example-with-source {
                        flex: 1 0 auto;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: stretch;
                        margin-top: 30px;
                    }

                    .example {
                        padding: 20px;
                        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
                        background-color: white;
                    }

                    .source {
                        margin: 20px 0;
                    }

                    :global(pre) {
                        overflow: auto;
                    }
                `}</style>
                <div className="example">
                    <Component />
                </div>
                <div className="source">
                    <button
                        className={`gd-button gd-button-secondary button-dropdown icon-right ${iconClassName}`}
                        onClick={this.toggle}
                    >
                        source code
                    </button>
                    {hidden ? (
                        ""
                    ) : (
                        <SyntaxHighlighter language="jsx" style={okaidia}>
                            {this.props.source}
                        </SyntaxHighlighter>
                    )}
                </div>
            </div>
        );
    }
}

export default ExampleWithSource;
