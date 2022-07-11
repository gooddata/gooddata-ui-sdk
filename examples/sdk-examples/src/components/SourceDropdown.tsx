// (C) 2020-2022 GoodData Corporation
import React from "react";
import { SourceContainer } from "../components/SourceContainer";

interface ISourceDropdownState {
    hidden: boolean;
    viewJS: boolean;
}

interface ISourceDropdownProps {
    source: string;
    sourceJS: string;
}

export class SourceDropdown extends React.Component<ISourceDropdownProps, ISourceDropdownState> {
    state: ISourceDropdownState = { hidden: true, viewJS: true };

    public toggle = (): void => {
        this.setState((state) => ({ ...state, hidden: !state.hidden }));
    };

    public switchLang = (isJS: boolean): void => {
        this.setState((state) => ({ ...state, viewJS: isJS }));
    };

    public render() {
        const { hidden, viewJS } = this.state;
        const { sourceJS, source } = this.props;

        const iconClassName = hidden ? "gd-icon-navigatedown" : "gd-icon-navigateup";

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
                        className={`gd-button gd-button-secondary button-dropdown gd-icon-right ${iconClassName}`}
                        onClick={this.toggle}
                    >
                        source code
                    </button>
                    {hidden ? (
                        ""
                    ) : (
                        <SourceContainer
                            toggleIsJS={this.switchLang}
                            isJS={viewJS}
                            source={source}
                            sourceJS={sourceJS}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default SourceDropdown;
