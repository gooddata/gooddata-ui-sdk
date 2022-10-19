// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IOptionsByReference } from "../types";
import { HeightSetting } from "./HeightSetting";
import { ToggleSwitch } from "./ToggleSwitch";

/**
 * @internal
 */
export interface IOptionsByReferenceProps {
    option: IOptionsByReference;
    onChange: (opt: IOptionsByReference) => void;
}

/**
 * @internal
 */
export const OptionsByReference: React.VFC<IOptionsByReferenceProps> = (props) => {
    const { option, onChange } = props;

    const intl = useIntl();

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space top-space">
                <FormattedMessage id="embedInsightDialog.code.options" />
            </strong>

            <ToggleSwitch
                id={"display-title"}
                className="bottom-space top-space"
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.display.title",
                })}
                checked={option.displayTitle}
                onChange={() => {
                    const opt = { ...option, displayTitle: !option.displayTitle };
                    onChange(opt);
                }}
            />

            <ToggleSwitch
                id={"custom-height"}
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.custom.height",
                })}
                checked={option.customHeight}
                onChange={() => {
                    const opt = { ...option, customHeight: !option.customHeight };
                    onChange(opt);
                }}
            />

            {option.customHeight ? (
                <HeightSetting
                    value={option.height}
                    unit={option.unit}
                    onValueChange={(height, unit) => {
                        const opt = { ...option, height, unit };
                        onChange(opt);
                    }}
                />
            ) : null}
        </div>
    );
};
