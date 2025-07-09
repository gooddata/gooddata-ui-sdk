// (C) 2022-2025 GoodData Corporation
import React from "react";
import { action } from "@storybook/addon-actions";
import { CodeArea } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import { code } from "./CodeMock.js";
const AreaWrapper: React.FC<{ children?: React.ReactNode }> = (props) => {
    const { children } = props;
    return <div style={{ width: 600, height: 250, margin: 20 }}>{children}</div>;
};

const CodeAreaExamples: React.VFC = () => {
    return (
        <>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Code area</h4>
                </div>
                <AreaWrapper>
                    <CodeArea code={code} onCopyCode={action("onCopyCode")} />
                </AreaWrapper>
            </div>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Scrollable code area</h4>
                </div>
                <AreaWrapper>
                    <CodeArea code={code + code + code} onCopyCode={action("onCopyCode")} />
                </AreaWrapper>
            </div>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>Empty code area</h4>
                </div>
                <AreaWrapper>
                    <CodeArea code={""} onCopyCode={action("onCopyCode")} />
                </AreaWrapper>
            </div>
        </>
    );
};

export default {
    title: "12 UI Kit/EmbedInsightDialog/CodeArea",
};

export const FullFeatured = () => <CodeAreaExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<CodeAreaExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
