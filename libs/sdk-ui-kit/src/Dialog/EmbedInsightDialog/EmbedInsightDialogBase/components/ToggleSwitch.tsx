// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { Bubble } from "../../../../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../../../../Bubble/BubbleHoverTrigger.js";

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

export function ToggleSwitch({
    id,
    label,
    checked,
    disabled,
    questionMarkMessage,
    className,
    onChange,
}: IToggleSwitchProps) {
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
}
