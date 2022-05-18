// (C) 2019-2022 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
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
    onEditingStart: () => void;
    onCancel: () => void;
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

    const bubbleMessage = useMemo(() => {
        const charactersCountLeft = maxLength - currentValue.length;
        const maximumCharactersCount = maxLength;
        return intl.formatMessage(
            { id: "layout.header.characters.left" },
            { charactersCountLeft, maximumCharactersCount },
        );
    }, [maxLength, currentValue, intl]);

    const isBubbleVisible = useMemo(() => {
        const currentValueLength = currentValue.length;
        return editing && maxLength - currentValueLength <= warningLimit;
    }, [currentValue, editing, maxLength, warningLimit]);

    const onStart = useCallback(() => {
        setEditing(true);
        onEditingStart();
    }, [setEditing, onEditingStart]);

    const onCancelCallback = () => {
        setEditing(true);
        setCurrentValue(value);
        onCancel();
    };

    const onSubmitCallback = useCallback(
        (value: string) => {
            setEditing(true);
            setCurrentValue(value);
            onSubmit(value);
        },
        [setEditing, setCurrentValue, onSubmit],
    );

    const onChange = useCallback(
        (value: string) => {
            setCurrentValue(value);
        },
        [setCurrentValue],
    );

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
