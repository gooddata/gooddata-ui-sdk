// (C) 2022-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "../../../../Bubble/index.js";

const alignPoints = [{ align: "cr cl" }];

export interface IToggleSwitchProps {
    id: string;
    label: string;
    questionMarkMessage?: string;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    onChange: () => void;
}

export const ToggleSwitch: React.VFC<IToggleSwitchProps> = (props) => {
    const { id, label, checked, disabled, questionMarkMessage, className, onChange } = props;

    const css = cx("toggle-wrapper-revers-label", className);

    return (
        <div className={css}>
            <label className="input-checkbox-toggle s-checkbox-toggle-label">
                <input
                    type="checkbox"
                    className={className}
                    id={id}
                    name={id}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="input-label-text toggle-switch" />
            </label>
            <label className="toggle-switch-title" htmlFor={label}>
                {label}
            </label>
            {questionMarkMessage ? (
                <BubbleHoverTrigger>
                    <span className="gd-icon-circle-question s-circle_question toggle-switch-icon" />
                    <Bubble alignPoints={alignPoints}>{questionMarkMessage}</Bubble>
                </BubbleHoverTrigger>
            ) : null}
        </div>
    );
};
