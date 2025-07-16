// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { CodeOptions, IReactOptions } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

const FullExampleByDefinition: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "reference",
        codeType: "ts",
        displayConfiguration: false,
        customHeight: true,
    });

    return (
        <>
            <h4>Display configuration off</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const FullExampleByReference: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "reference",
        codeType: "ts",
        displayConfiguration: true,
        customHeight: true,
    });

    return (
        <>
            <h4>Display configuration on</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CustomHeightExampleByDefinition: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "definition",
        codeType: "ts",
        displayConfiguration: true,
        customHeight: false,
    });

    return (
        <>
            <h4>Custom height off</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CustomHeightExampleByReference: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "reference",
        codeType: "ts",
        displayConfiguration: true,
        customHeight: false,
    });

    return (
        <>
            <h4>Custom height off</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CustomHeightFullDefinedExampleByDefinition: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "definition",
        codeType: "ts",
        displayConfiguration: true,
        customHeight: true,
        height: "600",
        unit: "px",
    });

    return (
        <>
            <h4>Custom height full defined</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CustomHeightFullDefinedExampleByReference: React.VFC = () => {
    const [option, setOption] = useState<IReactOptions>({
        type: "react",
        componentType: "reference",
        displayConfiguration: true,
        codeType: "ts",
        customHeight: true,
        height: "600",
        unit: "px",
    });

    return (
        <>
            <h4>Custom height full defined</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CodeOptionExamples: React.VFC = () => {
    return (
        <InternalIntlWrapper>
            <div className="screenshot-target library-component">
                <h2>Option by definition</h2>
                <FullExampleByDefinition />
                <CustomHeightExampleByDefinition />
                <CustomHeightFullDefinedExampleByDefinition />
                <h2>Option by reference</h2>
                <FullExampleByReference />
                <CustomHeightExampleByReference />
                <CustomHeightFullDefinedExampleByReference />
            </div>
        </InternalIntlWrapper>
    );
};

export default {
    title: "12 UI Kit/EmbedInsightDialog/CodeOption",
};

export const FullFeatured = () => <CodeOptionExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<CodeOptionExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
