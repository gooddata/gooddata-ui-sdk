// (C) 2020 GoodData Corporation
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ISourceContainerProps {
    isJS: boolean;
    toggleIsJS: (switchToJS: boolean) => void;
    source: string;
    sourceJS?: string;
}

const syntaxHighlighterStyling = { background: "transparent", padding: 0, margin: 0 };

export const SourceContainer: React.FC<ISourceContainerProps> = ({ isJS, toggleIsJS, source, sourceJS }) => {
    return (
        <div className="gd-source-container">
            <style jsx>
                {`
                    .gd-source-container {
                        background-color: rgb(39, 40, 34);
                        padding: 20px;
                        margin-top: 7px;
                        border-radius: 0.3em;
                    }

                    .gd-tabs {
                        margin-bottom: 30px !important;
                        border-bottom: 1px solid #94a1ad !important;
                    }

                    .gd-button-link:focus,
                    .gd-button-link-dimmed:focus {
                        border: none;
                        box-shadow: none;
                        border-bottom: 3px solid #14b2e2;
                    }

                    .gd-tab,
                    .gd-tab:hover {
                        color: #94a1ad;
                        font-family: Avenir, "Helvetica Neue", arial, sans-serif;
                    }

                    .gd-tab.is-active {
                        color: #ffffff;
                        border-color: #14b2e2;
                    }
                `}
            </style>
            <div className="gd-tabs">
                <a
                    role="button"
                    className={`gd-tab${isJS ? " is-active" : ""}`}
                    onClick={() => toggleIsJS(true)}
                >
                    JavaScript
                </a>
                <a className={`gd-tab${!isJS ? " is-active" : ""}`} onClick={() => toggleIsJS(false)}>
                    TypeScript
                </a>
            </div>
            <SyntaxHighlighter
                language={isJS ? "jsx" : "tsx"}
                style={okaidia}
                customStyle={syntaxHighlighterStyling}
            >
                {isJS ? sourceJS : source}
            </SyntaxHighlighter>
        </div>
    );
};
