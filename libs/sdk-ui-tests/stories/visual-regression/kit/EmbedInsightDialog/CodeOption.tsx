// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";

// import { CodeLanguageSelector } from "@gooddata/sdk-ui-kit"; TODO FIX import
import {
    IOptionsByDefinition,
    OptionsByDefinition,
} from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/components/OptionsByDefinition";

/**
 * @internal
 */
export const CodeOptionExamples: React.VFC = () => {
    const [option, setOption] = useState<IOptionsByDefinition>({
        includeConfiguration: true,
        customHeight: true,
        height: 400,
    });

    return (
        <>
            <div className="screenshot-target library-component">
                <h4>Option by definition</h4>
                <OptionsByDefinition option={option} onChange={(opt) => setOption(opt)} />
            </div>
        </>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/CodeOption`)
    .add("full-featured", () => <CodeOptionExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<CodeOptionExamples />), { screenshot: true });
