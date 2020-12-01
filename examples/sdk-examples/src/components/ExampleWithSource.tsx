// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { useState } from "react";
import { SourceContainer } from "./SourceContainer";

interface ISourceSectionProps {
    source: string;
    sourceJS?: string;
}

interface IExampleWithSourceProps extends ISourceSectionProps {
    for: React.ComponentType;
}

const SourceSection: React.FC<ISourceSectionProps> = ({ source, sourceJS }) => {
    const [hidden, setState] = useState(true);
    const [viewJS, setViewJS] = useState(true);
    const switchLang = (switchToJS: boolean) => setViewJS(switchToJS);
    const iconClassName = hidden ? "icon-navigatedown" : "icon-navigateup";

    return (
        <div className="source">
            <style jsx>{`
                .source {
                    margin: 20px 0;
                }

                :global(pre) {
                    overflow: auto;
                }
            `}</style>
            <button
                className={`gd-button gd-button-secondary button-dropdown icon-right ${iconClassName}`}
                onClick={() => setState(!hidden)}
            >
                source code
            </button>
            {hidden ? (
                ""
            ) : (
                <SourceContainer toggleIsJS={switchLang} isJS={viewJS} source={source} sourceJS={sourceJS} />
            )}
        </div>
    );
};

export const ExampleWithSource: React.FC<IExampleWithSourceProps> = ({
    for: Component,
    source,
    sourceJS,
}) => {
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
            `}</style>
            <div className="example">
                <Component />
            </div>
            <SourceSection source={source} sourceJS={sourceJS} />
        </div>
    );
};
