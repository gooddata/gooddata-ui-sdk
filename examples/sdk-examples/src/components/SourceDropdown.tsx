// (C) 2020 GoodData Corporation
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ISourceDropdownState {
    hidden: boolean;
    viewJS: boolean;
}

interface ISourceDropdownProps {
    source: string;
    sourceJS: string;
}

export class SourceDropdown extends React.Component<ISourceDropdownProps, ISourceDropdownState> {
    constructor(props: ISourceDropdownProps) {
        super(props);
        this.state = { hidden: true, viewJS: false };
    }

    public toggle = () => {
        this.setState(state => ({ ...state, hidden: !state.hidden }));
    };

    public toggleTSJS = () => {
        this.setState(state => ({ ...state, viewJS: !state.viewJS }));
    };

    public render() {
        const { hidden, viewJS } = this.state;
        const { sourceJS, source } = this.props;

        const iconClassName = hidden ? "icon-navigatedown" : "icon-navigateup";

        return (
            <div className="example-with-source">
                <style jsx>{`
                    .source {
                        margin: 20px 0;
                    }

                    :global(pre) {
                        overflow: auto;
                    }
                `}</style>
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
                        <button className={`gd-button gd-button-secondary`} onClick={this.toggleTSJS}>
                            {viewJS ? "TS" : "JS"}
                        </button>
                    )}
                    {hidden ? (
                        ""
                    ) : (
                        <SyntaxHighlighter language="jsx" style={okaidia}>
                            {viewJS ? sourceJS : source}
                        </SyntaxHighlighter>
                    )}
                </div>
            </div>
        );
    }
}

export default SourceDropdown;
