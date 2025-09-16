// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { action } from "storybook/actions";

import { CodeArea } from "@gooddata/sdk-ui-kit";

import { code } from "./CodeMock.js";
import { wrapWithTheme } from "../../themeWrapper.js";

function AreaWrapper(props: { children?: ReactNode }) {
    const { children } = props;
    return <div style={{ width: 600, height: 250, margin: 20 }}>{children}</div>;
}

function CodeAreaExamples() {
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
}

export default {
    title: "12 UI Kit/EmbedInsightDialog/CodeArea",
};

export function FullFeatured() {
    return <CodeAreaExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<CodeAreaExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
