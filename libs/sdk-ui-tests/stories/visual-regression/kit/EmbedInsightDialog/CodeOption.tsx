// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
// import { CodeLanguageSelector } from "@gooddata/sdk-ui-kit"; TODO FIX import
import { CodeOptions } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/components/CodeOptions";
import { CodeOptionType } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/types";

const FullExampleByDefinition: React.VFC = () => {
    const [option, setOption] = useState<CodeOptionType>({
        type: "definition",
        includeConfiguration: true,
        customHeight: true,
    });

    return (
        <>
            <h4>Custom height on</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const FullExampleByReference: React.VFC = () => {
    const [option, setOption] = useState<CodeOptionType>({
        type: "reference",
        displayTitle: true,
        customHeight: true,
    });

    return (
        <>
            <h4>Custom height on</h4>
            <CodeOptions option={option} onChange={(opt) => setOption(opt)} />
        </>
    );
};

const CustomHeightExampleByDefinition: React.VFC = () => {
    const [option, setOption] = useState<CodeOptionType>({
        type: "definition",
        includeConfiguration: true,
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
    const [option, setOption] = useState<CodeOptionType>({
        type: "reference",
        displayTitle: true,
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
    const [option, setOption] = useState<CodeOptionType>({
        type: "definition",
        includeConfiguration: true,
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
    const [option, setOption] = useState<CodeOptionType>({
        type: "reference",
        displayTitle: true,
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
