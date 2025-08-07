// (C) 2007-2025 GoodData Corporation
import React, { ReactNode, RefObject, useRef, useState, useEffect, useCallback, useMemo } from "react";
import identity from "lodash/identity.js";

import { ITextAreaWithSubmitProps } from "./typings.js";

/**
 * @internal
 */
export function TextAreaWithSubmit({
    className = "",
    maxLength = 100000,
    rows = 1,
    onCancel = identity,
    onEditingStart = identity,
    onChange = identity,
    placeholder = "",
    scrollToEndOnEditingStart = true,
    autofocus = false,
    disabled = false,
    defaultValue,
    onSubmit: onSubmitProp,
}: ITextAreaWithSubmitProps) {
    const [value, setValue] = useState(defaultValue);
    const [isEditing, setIsEditing] = useState(false);
    const root: RefObject<any> = useRef();
    const textarea: RefObject<HTMLTextAreaElement> = useRef();
    const focusTimeoutRef = useRef<number>(0);

    const onSelectStart = useCallback((e: Event): void => {
        e.stopPropagation();
    }, []);

    const isClickOutsideTextarea = useCallback((clickedTarget: EventTarget): boolean => {
        return textarea.current && !textarea.current.contains(clickedTarget as HTMLElement);
    }, []);

    const onDocumentClick = useCallback(
        (e: MouseEvent): void => {
            if (isClickOutsideTextarea(e.target)) {
                const textAreaNode = textarea.current;
                textAreaNode.blur();
            }
        },
        [isClickOutsideTextarea],
    );

    const removeListeners = useCallback((): void => {
        document.removeEventListener("mousedown", onDocumentClick);
    }, [onDocumentClick]);

    const onSubmit = useCallback((): void => {
        const oldValue = defaultValue;
        const newTrimmedValue = value.trim();

        if (newTrimmedValue === "") {
            setValue("");
        }

        if (oldValue !== newTrimmedValue) {
            onSubmitProp(newTrimmedValue);
        } else {
            onCancel(oldValue);
        }

        setValue(newTrimmedValue);
        setIsEditing(false);
        removeListeners();
    }, [defaultValue, value, onSubmitProp, onCancel, removeListeners]);

    const onCancelHandler = useCallback((): void => {
        onCancel(defaultValue);

        setValue(defaultValue);
        setIsEditing(false);
        removeListeners();
    }, [defaultValue, onCancel, removeListeners]);

    const onChangeHandler = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
            const { value } = e.target;
            setValue(value);
            onChange(value);
        },
        [onChange],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
            const isSubmit = e.key === "Enter" && !e.shiftKey;
            const isCancel = e.key === "Escape";

            if (isSubmit || isCancel) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (isSubmit) {
                onSubmit();
            }
            if (isCancel) {
                onCancelHandler();
            }
        },
        [onSubmit, onCancelHandler],
    );

    const isMultiLine = useCallback((): boolean => {
        return rows > 1;
    }, [rows]);

    const selectAndFocus = useCallback((): void => {
        const componentElement = textarea.current;

        if (componentElement) {
            window.clearTimeout(focusTimeoutRef.current);
            // without the timeout the focus sometimes got stolen by the previously active item for some reason
            focusTimeoutRef.current = window.setTimeout(() => {
                componentElement.focus();

                if (scrollToEndOnEditingStart && isMultiLine()) {
                    componentElement.scrollTop = componentElement.scrollHeight;
                }

                componentElement.select();
            }, 1);
        }
    }, [scrollToEndOnEditingStart, isMultiLine]);

    const edit = useCallback(
        (_e?: React.MouseEvent<HTMLDivElement>): void => {
            if (!isEditing) {
                setIsEditing(true);
                // Use setTimeout to ensure state update is processed before side effects
                setTimeout(() => {
                    selectAndFocus();
                    document.addEventListener("mousedown", onDocumentClick);
                }, 0);

                onEditingStart();
            }
        },
        [isEditing, selectAndFocus, onDocumentClick, onEditingStart],
    );

    const renderTextarea = useCallback(
        (style = {}): ReactNode => {
            return (
                <textarea
                    className={className}
                    style={style}
                    rows={rows}
                    maxLength={maxLength}
                    onKeyDown={onKeyDown}
                    onBlur={onSubmit}
                    onChange={onChangeHandler}
                    value={value}
                    placeholder={placeholder}
                    ref={textarea}
                    disabled={disabled}
                />
            );
        },
        [className, rows, maxLength, onKeyDown, onSubmit, onChangeHandler, value, placeholder, disabled],
    );

    const renderTextAreaWithSubmitEdit = useMemo((): ReactNode => {
        return renderTextarea({});
    }, [renderTextarea]);

    useEffect(() => {
        const rootNode = root.current;
        if (rootNode) {
            rootNode.addEventListener("dragstart", onSelectStart);
            rootNode.addEventListener("selectstart", onSelectStart);
        }

        if (autofocus) {
            edit();
        }

        return () => {
            if (rootNode) {
                rootNode.removeEventListener("dragstart", onSelectStart);
                rootNode.removeEventListener("selectstart", onSelectStart);
            }
            removeListeners();
            clearTimeout(focusTimeoutRef.current);
        };
    }, [autofocus, edit, onSelectStart, removeListeners]);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <div role="editable-label" onClick={edit}>
            <div ref={root}>{renderTextAreaWithSubmitEdit}</div>
        </div>
    );
}
