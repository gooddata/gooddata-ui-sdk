// (C) 2022-2025 GoodData Corporation

import { useMemo } from "react";

import { EmbedInsightCodeArea } from "./CodeArea.js";
import { PrepareEnvMessage } from "./PrepareEnvMessage.js";
import { ReactOptions } from "./ReactOptions.js";
import { WebComponentsOptions } from "./WebComponentsOptions.js";
import { EmbedOptionsType, IReactOptions, IWebComponentsOptions } from "../types.js";

interface IEmbedInsightContentProps {
    integrationDocLink: string;
    embedTypeOptions: EmbedOptionsType;
    code: string;
    openSaveInsightDialog: () => void;
    onCopyCode: () => void;
    onOptionsChange: (opt: IReactOptions | IWebComponentsOptions) => void;
}
/**
 * @internal
 */
export function EmbedInsightContent({
    integrationDocLink,
    embedTypeOptions,
    code,
    openSaveInsightDialog,
    onCopyCode,
    onOptionsChange,
}: IEmbedInsightContentProps) {
    const renderEmbedOptions = useMemo(() => {
        return embedTypeOptions.type === "react" ? (
            <ReactOptions option={embedTypeOptions as IReactOptions} onChange={onOptionsChange} />
        ) : (
            <WebComponentsOptions
                option={embedTypeOptions as IWebComponentsOptions}
                onChange={onOptionsChange}
            />
        );
    }, [embedTypeOptions, onOptionsChange]);

    return (
        <div className="embed-insight-dialog-content">
            <PrepareEnvMessage integrationDocLink={integrationDocLink} />
            <div className="embed-insight-dialog-code">
                <div className="embed-insight-dialog-code-settings">{renderEmbedOptions}</div>
                <div className="embed-insight-dialog-code-wrapper">
                    <EmbedInsightCodeArea
                        code={code}
                        componentType={(embedTypeOptions as IReactOptions)?.componentType}
                        onCopyCode={onCopyCode}
                        embedType={embedTypeOptions.type}
                        openSaveInsightDialog={openSaveInsightDialog}
                    />
                </div>
            </div>
        </div>
    );
}
