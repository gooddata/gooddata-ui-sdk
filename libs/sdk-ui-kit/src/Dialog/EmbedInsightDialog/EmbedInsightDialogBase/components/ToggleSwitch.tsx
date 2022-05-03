// (C) 2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";

const alignPoints = [{ align: "cr cl" }];

export interface IToggleSwitchProps {
    id: string;
    label: string;
    questionMarkMessage?: string;
    checked?: boolean;
    className?: string;
    onChange: () => void;
}

export const ToggleSwitch: React.VFC<IToggleSwitchProps> = (props) => {
    const { id, label, checked, questionMarkMessage, className, onChange } = props;

    return (
        <div className="toggle-wrapper-revers-label">
            <label className="input-checkbox-toggle s-checkbox-toggle-label">
                <input
                    type="checkbox"
                    className={className}
                    id={id}
                    name={id}
                    checked={checked}
                    onChange={onChange}
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
