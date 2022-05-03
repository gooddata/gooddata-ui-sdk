// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IOptionsByDefinition } from "../types";
import { HeightSetting } from "./HeightSetting";
import { ToggleSwitch } from "./ToggleSwitch";

/**
 * @internal
 */
export interface IOptionsByDefinitionProps {
    option: IOptionsByDefinition;
    onChange: (opt: IOptionsByDefinition) => void;
}

/**
 * @internal
 */
export const OptionsByDefinition: React.VFC<IOptionsByDefinitionProps> = (props) => {
    const { option, onChange } = props;
    const intl = useIntl();

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">
                <FormattedMessage id="embedInsightDialog.code.options" />
            </strong>

            <ToggleSwitch
                id="include-configuration"
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.include.config",
                })}
                questionMarkMessage={intl.formatMessage({
                    id: "embedInsightDialog.code.options.include.config.info",
                })}
                checked={option.includeConfiguration}
                onChange={() => {
                    const opt = { ...option, includeConfiguration: !option.includeConfiguration };
                    onChange(opt);
                }}
            />

            <ToggleSwitch
                id="custom-height"
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.custom.height",
                })}
                checked={option.customHeight}
                onChange={() => {
                    const opt = { ...option, customHeight: !option.customHeight };
                    onChange(opt);
                }}
            />

            {option.customHeight && (
                <HeightSetting
                    value={option.height}
                    unit={option.unit}
                    onValueChange={(height, unit) => {
                        const opt = { ...option, height, unit };
                        onChange(opt);
                    }}
                />
            )}
        </div>
    );
};
