// (C) 2022-2023 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { IReactOptions, UnitsType } from "../types.js";

import { HeightSetting } from "./HeightSetting.js";
import { ToggleSwitch } from "./ToggleSwitch.js";

/**
 * @internal
 */
export interface ICodeOptionsProps {
    option: IReactOptions;
    onChange: (opt: IReactOptions) => void;
}

/**
 * @internal
 */
export const CodeOptions: React.VFC<ICodeOptionsProps> = (props) => {
    const intl = useIntl();
    const { option, onChange } = props;

    const onDisplayConfigurationChange = useCallback(() => {
        const opt = { ...option, displayConfiguration: !option.displayConfiguration };
        onChange(opt);
    }, [option, onChange]);

    const onCustomHeightChange = useCallback(() => {
        const opt = { ...option, customHeight: !option.customHeight };
        onChange(opt);
    }, [option, onChange]);

    const onHeightValueChange = useCallback(
        (height: string, unit: UnitsType) => {
            const opt = { ...option, height, unit };
            onChange(opt);
        },
        [option, onChange],
    );

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">
                <FormattedMessage id="embedInsightDialog.react.options" />
            </strong>

            <ToggleSwitch
                id={"display-configuration"}
                className="bottom-space"
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.display.configuration",
                })}
                questionMarkMessage={intl.formatMessage({
                    id: "embedInsightDialog.code.options.include.config.info",
                })}
                checked={option.displayConfiguration}
                onChange={onDisplayConfigurationChange}
            />

            <ToggleSwitch
                id={"custom-height"}
                label={intl.formatMessage({
                    id: "embedInsightDialog.code.options.custom.height",
                })}
                checked={option.customHeight}
                onChange={onCustomHeightChange}
            />

            {option.customHeight ? (
                <HeightSetting value={option.height} unit={option.unit} onValueChange={onHeightValueChange} />
            ) : null}
        </div>
    );
};
