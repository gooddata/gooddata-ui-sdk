// (C) 2019-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { Bubble, EditableLabel } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

const BUBBLE_ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [0, 7] };
const BUBBLE_STYLE = "bubble-primary";

export interface IEditableLabelWithBubbleProps {
    className: string;
    alignTo: string;
    maxRows: number;
    value: string;
    maxLength: number;
    placeholderMessage: string;
    warningLimit: number;
    onSubmit: (value: string) => void;
    onEditingStart?: () => void;
    onCancel?: () => void;
    children?: React.ReactNode;
}

export function EditableLabelWithBubble({
    onEditingStart,
    maxLength,
    value,
    warningLimit,
    onCancel,
    alignTo,
    className,
    maxRows,
    placeholderMessage,
    children,
    onSubmit,
}: IEditableLabelWithBubbleProps): JSX.Element {
    const intl = useIntl();

    const [currentValue, setCurrentValue] = useState(value);
    const [editing, setEditing] = useState(false);

    const charactersCountLeft = maxLength - currentValue.length;
    const maximumCharactersCount = maxLength;
    const bubbleMessage = intl.formatMessage(
        { id: "layout.header.characters.left" },
        { currentCharactersCount: charactersCountLeft, maximumCharactersCount },
    );

    const currentValueLength = currentValue.length;
    const isBubbleVisible = editing && maxLength - currentValueLength <= warningLimit;

    const onStart = useCallback(() => {
        setEditing(true);
        onEditingStart?.();
    }, [onEditingStart]);

    const onCancelCallback = useCallback(() => {
        setEditing(true);
        setCurrentValue(value);
        onCancel?.();
    }, [onCancel, value]);

    const onSubmitCallback = useCallback(
        (newValue: string) => {
            setEditing(true);
            setCurrentValue(newValue);
            onSubmit(newValue);
        },
        [onSubmit],
    );

    const onChange = useCallback((newValue: string) => {
        setCurrentValue(newValue);
    }, []);

    return (
        <>
            <EditableLabel
                className={className}
                maxRows={maxRows}
                value={value}
                maxLength={maxLength}
                placeholder={placeholderMessage}
                onEditingStart={onStart}
                onCancel={onCancelCallback}
                onChange={onChange}
                onSubmit={onSubmitCallback}
            >
                {children}
            </EditableLabel>
            {isBubbleVisible ? (
                <Bubble
                    alignTo={alignTo}
                    className={BUBBLE_STYLE}
                    alignPoints={BUBBLE_ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    {bubbleMessage}
                </Bubble>
            ) : null}
        </>
    );
}
