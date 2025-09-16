// (C) 2022-2025 GoodData Corporation

import { ChangeEvent, useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { CodeLanguageType } from "../types.js";

/**
 * @internal
 */
export interface ICodeLanguageSelectProps {
    selectedLanguage: CodeLanguageType;
    onLanguageChanged: (language: CodeLanguageType) => void;
}

/**
 * @internal
 */
export function CodeLanguageSelect({ selectedLanguage, onLanguageChanged }: ICodeLanguageSelectProps) {
    const onCheck = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value as CodeLanguageType;
            onLanguageChanged(value);
        },
        [onLanguageChanged],
    );

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">
                <FormattedMessage id="embedInsightDialog.code.language.codeAs" />
            </strong>
            <label className="input-radio-label bottom-space s-language-ts">
                <input
                    type="radio"
                    className="input-radio"
                    value={"ts"}
                    checked={selectedLanguage === "ts"}
                    onChange={onCheck}
                />
                <span className="input-label-text">TypeScript</span>
            </label>
            <label className="input-radio-label bottom-space s-language-js">
                <input
                    type="radio"
                    className="input-radio"
                    value={"js"}
                    checked={selectedLanguage === "js"}
                    onChange={onCheck}
                />
                <span className="input-label-text">JavaScript</span>
            </label>
        </div>
    );
}
