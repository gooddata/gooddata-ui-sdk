// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type ReactElement,
    type FocusEvent as ReactFocusEvent,
    type Ref,
    forwardRef,
    useId,
    useImperativeHandle,
    useState,
} from "react";

import cx from "classnames";

import { useFocus } from "../../../shared/hooks/useFocus.js";
import { makeStyles } from "../../../shared/theme/index.js";

import { EditableRowError } from "./EditableRowError.js";

const useStyles = makeStyles<{ minWidth: number }>()((theme, { minWidth }) => ({
    root: {
        ...theme.globals.normalItemStyle,
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
        minWidth,
        border: "1px solid transparent",
        cursor: "text",

        "&.small": { ...theme.globals.smallItemStyle },
        "&.readOnly": { cursor: "default" },

        "&.is-active": { borderColor: theme.globals.colors.editableRowHover },
        "&.is-warning": { borderColor: theme.globals.colors.warning },
        "&.is-error": { borderColor: theme.globals.colors.negative },
    },
    prefix: {
        flex: "0 0 auto",
        whiteSpace: "pre",
    },
    field: {
        position: "relative",
        flex: "1 1 auto",
        minWidth: 0,
        overflow: "hidden",
        alignSelf: "stretch",
    },
    sizer: {
        display: "block",
        whiteSpace: "pre",
        visibility: "hidden",
        pointerEvents: "none",
    },
    input: {
        position: "absolute",
        inset: 0,
        width: "100%",
        margin: 0,
        padding: 0,
        border: 0,
        outline: 0,
        background: "transparent",
        font: "inherit",
        color: "inherit",
        textOverflow: "ellipsis",
        "&::placeholder": { color: theme.globals.colors.placeholder },
    },
}));

export interface IInlineEditableValueHandle {
    focus: () => void;
}

export interface IInlineEditableValueProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (e?: FocusEvent) => void;
    onChangeValueTransformer?: (value: string) => string | null;
    onEditEndsValueTransformer?: (value: string) => string;
    prefix?: string;
    placeholder?: string;
    ariaLabel?: string;
    size?: "small" | "large";
    minWidth?: number;
    revealOnHover?: boolean;
    readOnly?: boolean;
    showError?: boolean;
    errorMessage?: ReactElement | string;
    showWarning?: boolean;
    warningMessage?: ReactElement | string;
    className?: string;
    ref?: Ref<IInlineEditableValueHandle>;
}

// A size="small" box with no minimum height collapses without a line box to measure.
const ZERO_WIDTH_SPACE = "\u200B";

/** A value edited in place, in a box always as wide as its value. */
export const InlineEditableValue = forwardRef<IInlineEditableValueHandle, IInlineEditableValueProps>(
    function InlineEditableValue(
        {
            value = "",
            onChange,
            onBlur,
            onChangeValueTransformer,
            onEditEndsValueTransformer,
            prefix,
            placeholder = "",
            ariaLabel,
            size = "large",
            minWidth = 40,
            revealOnHover = true,
            readOnly,
            showError,
            errorMessage,
            showWarning,
            warningMessage,
            className,
        },
        ref,
    ) {
        const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
        const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
        const [focusRequested, setFocusRequested] = useState(false);
        const [isHovered, setIsHovered] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const { classes } = useStyles({ minWidth });

        useImperativeHandle(ref, () => ({ focus: () => setFocusRequested(true) }));

        // Applied once the input is visible rather than straight away, so a click that asks
        // for the focus cannot take it back.
        useFocus(inputElement, focusRequested);

        const id = useId();
        const errorId = `${id}-error`;
        const warningId = `${id}-warning`;
        // Both surface only while the user is at the field. Validation focuses the field it
        // rejected, so a failed save still shows its error.
        const atField = !readOnly && (isHovered || isFocused);
        const errorVisible = atField && Boolean(showError);
        const warningVisible = atField && Boolean(showWarning) && !showError;
        const describedBy =
            [
                errorVisible && errorMessage ? errorId : undefined,
                warningVisible && warningMessage ? warningId : undefined,
            ]
                .filter(Boolean)
                .join(" ") || undefined;

        const handleChange = (next: string) => {
            const changeValue = onChangeValueTransformer ? onChangeValueTransformer(next) : next;
            if (changeValue !== null) {
                onChange(changeValue);
            }
        };

        const handleBlur = (e: ReactFocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setFocusRequested(false);
            if (readOnly) {
                return;
            }

            // Always reported: the form marks the field touched and clears its focus
            // tracking from here. Committed only on a real change, so leaving a generated
            // id untouched does not count as editing it.
            const transformed = onEditEndsValueTransformer?.(value) ?? value;
            onBlur?.(e.nativeEvent);
            if (transformed !== value) {
                onChange(transformed);
            }
        };

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.currentTarget.blur();
            }
        };

        if (readOnly && value.length === 0) {
            return null;
        }

        return (
            <span
                ref={setRootElement}
                className={cx(classes.root, size, className, "s-editable_row", {
                    readOnly,
                    "is-active": !readOnly && ((revealOnHover && isHovered) || isFocused),
                    "is-error": errorVisible,
                    "is-warning": warningVisible,
                })}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {prefix ? <span className={classes.prefix}>{prefix}</span> : null}
                <span className={classes.field}>
                    <span aria-hidden className={classes.sizer}>
                        {value || placeholder || ZERO_WIDTH_SPACE}
                    </span>
                    <input
                        ref={setInputElement}
                        type="text"
                        className={cx(classes.input, "s-editable_row_input")}
                        value={value}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        aria-label={ariaLabel}
                        aria-invalid={showError}
                        aria-describedby={describedBy}
                        onChange={(e) => handleChange(e.target.value.toString())}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            // Focus asked for from code offers the value for replacement; a
                            // click keeps the caret where the user put it.
                            if (focusRequested) {
                                inputElement?.select();
                            }
                        }}
                        onBlur={handleBlur}
                    />
                </span>
                {rootElement ? (
                    <EditableRowError
                        alignTo={rootElement}
                        showError={errorVisible}
                        errorMessage={errorMessage}
                        errorId={errorId}
                        showWarning={warningVisible}
                        warningMessage={warningMessage}
                        warningId={warningId}
                    />
                ) : null}
            </span>
        );
    },
);
