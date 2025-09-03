// (C) 2025 GoodData Corporation

import React from "react";

import { IntlProvider } from "react-intl";

import { UiCard } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

const sx = { width: 300, display: "flex", justifyContent: "flex-start", gap: "10px" };

function UiCardExamples() {
    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <h3>Card component</h3>
                <Example title="Card elevation 1">
                    <div style={sx}>
                        <UiCard elevation="1">This is card content</UiCard>
                    </div>
                </Example>
                <Example title="Card elevation 2">
                    <div style={sx}>
                        <UiCard elevation="2">This is card content</UiCard>
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiCard",
};

export function Default() {
    return <UiCardExamples />;
}
Default.parameters = { kind: "default" };

export const Themed = () => wrapWithTheme(<UiCardExamples />);
Themed.parameters = { kind: "themed" };
