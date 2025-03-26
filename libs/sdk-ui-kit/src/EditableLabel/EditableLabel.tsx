// (C) 2007-2025 GoodData Corporation
import React, { forwardRef, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import identity from "lodash/identity.js";
import ReactTextareaAutosize from "react-textarea-autosize";
import cx from "classnames";
import { defaultImport } from "default-import";

import { Overlay } from "../Overlay/index.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";

import { IEditableLabelProps } from "./typings.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const TextareaAutosize = defaultImport(ReactTextareaAutosize);

/**
 * @internal
 */
export const EditableLabel = forwardRef<HTMLDivElement, IEditableLabelProps>((props, ref) => {
    const {
        children = false,
        className = "",
        maxLength = 100000,
        maxRows = 1,
        onSubmit,
        onCancel = identity,
        onEditingStart = identity,
        onChange = identity,
        placeholder = "",
        scrollToEndOnEditingStart = true,
        textareaInOverlay = false,
        autofocus = false,
        isEditableLabelWidthBasedOnText = false,
        ariaLabel,
        autocomplete,
    } = props;

    const rootRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const focusTimeoutRef = useRef<number | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [doFocus, setDoFocus] = useState(false);
    const [rootWidth, setRootWidth] = useState(0);
    const [textareaWidth, setTextareaWidth] = useState(100);
    const [textareaFontSize, setTextareaFontSize] = useState<number | undefined>(undefined);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const onDocumentClick = useCallback((e: MouseEvent): void => {
        if (isClickOutsideTextarea(e.target)) {
            const textAreaNode = textareaRef.current;
            if (textAreaNode) {
                textAreaNode.blur();
            }
        }
    }, []);

    const removeListeners = useCallback((): void => {
        document.removeEventListener("click", onDocumentClick);
    }, [onDocumentClick]);

    const isMultiLine = useMemo((): boolean => {
        return maxRows > 1;
    }, [maxRows]);

    const measureRootDimensions = useCallback((): void => {
        const rootElement = rootRef.current;
        const rootElementFontSize = getComputedStyle(rootElement).fontSize;

        setTextareaWidth(rootElement.offsetWidth);
        setTextareaFontSize(Math.floor(parseInt(rootElementFontSize, 10)));
    }, [rootRef]);

    const selectAndFocus = useCallback((): void => {
        const componentElement = textareaRef.current;

        if (componentElement) {
            window.clearTimeout(focusTimeoutRef.current);
            // without the timeout the focus sometimes got stolen by the previously active item for some reason
            focusTimeoutRef.current = window.setTimeout(() => {
                componentElement.focus();

                if (scrollToEndOnEditingStart && isMultiLine) {
                    componentElement.scrollTop = componentElement.scrollHeight;
                }

                componentElement.select();

                if (textareaInOverlay) {
                    measureRootDimensions();
                }
            }, 1);
        }
    }, [scrollToEndOnEditingStart, isMultiLine, textareaInOverlay, measureRootDimensions]);

    const edit = useCallback(
        (_e?: React.MouseEvent<HTMLDivElement>): void => {
            if (!isEditing) {
                setIsEditing(true);
                document.addEventListener("mousedown", onDocumentClick);
                setDoFocus(true);

                onEditingStart();
            }
        },
        [isEditing, onEditingStart, onDocumentClick],
    );

    useEffect(() => {
        const rootNode = rootRef.current;
        const focusTimeoutId = focusTimeoutRef.current;

        const onSelectStart = (e: DragEvent): void => {
            e.stopPropagation();
        };

        if (rootNode) {
            rootNode.addEventListener("dragstart", onSelectStart);
            rootNode.addEventListener("selectstart", onSelectStart);
            resizeObserverRef.current = new ResizeObserver(() => {
                setRootWidth(rootNode.offsetWidth);
            });

            resizeObserverRef.current.observe(rootNode);
        }

        document.addEventListener("click", onDocumentClick);

        if (autofocus) {
            edit();
        }

        return () => {
            if (rootNode) {
                rootNode.removeEventListener("dragstart", onSelectStart);
                rootNode.removeEventListener("selectstart", onSelectStart);
                if (resizeObserverRef.current) {
                    resizeObserverRef.current.unobserve(rootNode);
                }
            }
            removeListeners();
            if (focusTimeoutId) {
                clearTimeout(focusTimeoutId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (doFocus && isEditing) {
            selectAndFocus();
            setDoFocus(false);
        }
    }, [doFocus, isEditing, selectAndFocus]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        const isSubmit = e.keyCode === ENUM_KEY_CODE.KEY_CODE_ENTER;
        const isCancel = e.keyCode === ENUM_KEY_CODE.KEY_CODE_ESCAPE;

        if (isSubmit || isCancel) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (isSubmit) {
            onSubmitHandler();
        }
        if (isCancel) {
            onCancelHandler();
        }
    };

    const onSubmitHandler = (): void => {
        const oldValue = props.value;
        const newTrimmedValue = value.trim();

        if (newTrimmedValue === "") {
            setValue("");
        }

        if (oldValue !== newTrimmedValue) {
            onSubmit(newTrimmedValue);
        } else {
            onCancel(oldValue);
        }

        setValue(newTrimmedValue);
        setIsEditing(false);
        removeListeners();
    };

    const onCancelHandler = (): void => {
        onCancel(props.value);
        setValue(props.value);
        setIsEditing(false);
        removeListeners();
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const { value } = e.target;
        setValue(value);
        onChange(value);
    };

    const isClickOutsideTextarea = (target: EventTarget | null): boolean => {
        const textAreaNode = textareaRef.current;
        return textAreaNode && !textAreaNode.contains(target as Node);
    };

    const renderTextarea = (style = {}): ReactNode => {
        return (
            <TextareaAutosize
                style={style}
                rows={1}
                maxRows={maxRows}
                maxLength={maxLength}
                onKeyDown={onKeyDown}
                onBlur={onSubmitHandler}
                onChange={onChangeHandler}
                defaultValue={props.value}
                placeholder={placeholder}
                ref={textareaRef}
                aria-label={ariaLabel}
                autoComplete={autocomplete}
            />
        );
    };

    const renderEditableLabelEdit = (): ReactNode => {
        return textareaInOverlay
            ? renderTextAreaInOverlay()
            : renderTextarea(rootRef.current && isEditableLabelWidthBasedOnText ? { width: rootWidth } : {});
    };

    const renderTextAreaInOverlay = (): ReactNode => {
        const alignId = `gd-editable-label-${uuid()}`;

        const style = {
            width: textareaWidth,
            fontSize: `${textareaFontSize}px`,
            // http://stackoverflow.com/a/6295222
            lineHeight: `${textareaFontSize * 1.25}px`,
        };

        return (
            <div data-testid="textarea-wrapper" className={`${alignId} gd-editable-label-textarea-wrapper`}>
                <Overlay
                    alignTo={`.${alignId}`}
                    alignPoints={[
                        {
                            align: "cr cr",
                        },
                    ]}
                >
                    <div className="gd-editable-label-overlay">{renderTextarea(style)}</div>
                </Overlay>
            </div>
        );
    };

    const editableLabelClasses = cx(
        {
            "gd-editable-label": true,
            "s-editable-label": true,
            "is-editing": isEditing,
            placeholder: value === "",
        },
        className,
    );

    const displayValue = children || value || placeholder;

    return (
        <div data-testid="editable-label" ref={ref} className={editableLabelClasses} onClick={edit}>
            <div className="gd-editable-label-inner" ref={rootRef}>
                {isEditing ? renderEditableLabelEdit() : displayValue}
            </div>
        </div>
    );
});

EditableLabel.displayName = "EditableLabel";
