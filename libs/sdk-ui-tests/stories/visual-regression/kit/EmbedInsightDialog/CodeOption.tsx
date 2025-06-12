// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { CodeOptions, IReactOptions } from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
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

/**
 * @internal
 */
export const CodeOptionExamples: React.VFC = () => {
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

storiesOf(`${UiKit}/EmbedInsightDialog/CodeOption`)
    .add("full-featured", () => <CodeOptionExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<CodeOptionExamples />), { screenshot: true });
