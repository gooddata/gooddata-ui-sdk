// (C) 2024 GoodData Corporation

import React from "react";
import { IAlignPoint, Overlay, Button, Hyperlink } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import merge from "lodash/merge.js";
import * as jsYaml from "js-yaml";

import { messages } from "../../../../locales.js";

import { SNIPPETS, IChartConfigurationItemSnippet } from "./snippets.js";
import { SnippetHeader, SnippetItem } from "./SnippetItem.js";
import { CodeMirrorEditor } from "./CodeMirrorEditor.js";

const EDITOR_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "br bl",
        offset: { x: 10, y: 0 },
    },
];

export interface IConfigEditorProps {
    value?: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

export const ConfigEditor: React.FC<IConfigEditorProps> = ({ value, onSubmit, onCancel }) => {
    const intl = useIntl();
    const [currentYamlValue, setCurrentYamlValue] = React.useState(value);

    const onSave = () => onSubmit(currentYamlValue === "" ? undefined : currentYamlValue);

    const onSnippet = (snippet: IChartConfigurationItemSnippet) => {
        if (currentYamlValue === "" || currentYamlValue === undefined) {
            setCurrentYamlValue(jsYaml.dump(snippet.value));
            return;
        }
        try {
            const currentYamlValueAsJson = jsYaml.load(currentYamlValue);
            const mergedJson = merge(currentYamlValueAsJson, snippet.value);
            setCurrentYamlValue(jsYaml.dump(mergedJson));
        } catch (e) {
            console.error("Merging of snippet with current value failed. Current value has a lint error.", e);
        }
    };

    return (
        <Overlay
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            alignTo=".gd-advanced-section"
            alignPoints={EDITOR_ALIGN_POINTS}
            onClose={onCancel}
        >
            <div className="gd-dropdown overlay">
                <div className="gd-advanced-customization-dialog">
                    <div className="gd-advanced-customization-dialog__header">
                        <span>{intl.formatMessage(messages.chartConfigOverrideTitle)}</span>
                        <button
                            className="gd-button-link gd-button-icon-only gd-icon-cross"
                            onClick={onCancel}
                        />
                    </div>
                    <div className="gd-advanced-customization-dialog__content">
                        <div className="gd-advanced-customization-dialog__main">
                            <CodeMirrorEditor value={currentYamlValue} onChange={setCurrentYamlValue} />
                        </div>
                        <div className="gd-advanced-customization-dialog__snippets">
                            <div className="gd-advanced-customization-dialog__snippets--header">
                                <div>{intl.formatMessage(messages.snippetsHeader)}</div>
                                <div className="gd-advanced-customization-dialog__snippets--header__line" />
                            </div>
                            {SNIPPETS.map((snippet) =>
                                snippet.type === "header" ? (
                                    <SnippetHeader key={snippet.id} snippet={snippet} />
                                ) : (
                                    <SnippetItem key={snippet.id} snippet={snippet} onClick={onSnippet} />
                                ),
                            )}
                        </div>
                    </div>
                    <div className="gd-advanced-customization-dialog__footer">
                        <Hyperlink
                            iconClass="gd-icon-circle-question"
                            href="https://www.gooddata.com/docs/cloud/"
                            text={intl.formatMessage(messages.chartConfigOverrideLink)}
                            className="gd-chart-override-link"
                        />
                        <div>
                            <Button
                                className="gd-button-secondary gd-button-small"
                                onClick={onCancel}
                                value={intl.formatMessage({
                                    id: "properties.advanced.chartConfigOverride.button.cancel",
                                })}
                            />
                            <Button
                                className="gd-button-action gd-button-small"
                                onClick={onSave}
                                value={intl.formatMessage({
                                    id: "properties.advanced.chartConfigOverride.button.apply",
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Overlay>
    );
};
