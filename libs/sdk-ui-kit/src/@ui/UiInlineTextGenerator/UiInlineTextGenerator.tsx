// (C) 2026 GoodData Corporation

import {
    type FocusEvent as ReactFocusEvent,
    type MouseEvent as ReactMouseEvent,
    type Ref,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { EditableLabel } from "../../EditableLabel/EditableLabel.js";
import { type IEditableLabelProps } from "../../EditableLabel/typings.js";
import { bem } from "../@utils/bem.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-inline-text-generator");

/**
 * Result returned by the text generation callback.
 * @internal
 */
export interface IUiInlineTextGeneratorResult {
    text: string;
}

/**
 * @internal
 */
export interface IUiInlineTextGeneratorProps extends Omit<
    IEditableLabelProps,
    "onSubmit" | "onCancel" | "onEditingStart"
> {
    onSubmit: (value: string) => void;
    onCancel?: (value: string) => void;
    onEditingStart?: () => void;
    onGenerate: () => Promise<IUiInlineTextGeneratorResult>;
    onGenerateError?: (error: Error) => void;
    onUndo?: () => void;
    generateButtonLabel: string;
    undoButtonLabel: string;
    generatingLabel?: string;
    generateButtonDataTestId?: string;
    undoButtonDataTestId?: string;
    dataTestId?: string;
}

/**
 * @internal
 */
export const UiInlineTextGenerator = forwardRef<HTMLDivElement, IUiInlineTextGeneratorProps>(
    (
        {
            value,
            onSubmit,
            onCancel,
            onEditingStart,
            onChange,
            onGenerate,
            onGenerateError,
            onUndo,
            generateButtonLabel,
            undoButtonLabel,
            generatingLabel,
            generateButtonDataTestId,
            undoButtonDataTestId,
            dataTestId,
            ...editableLabelProps
        },
        ref: Ref<HTMLDivElement>,
    ) => {
        const [isEditing, setIsEditing] = useState(false);
        const [isGenerating, setIsGenerating] = useState(false);
        const [generationKey, setGenerationKey] = useState(0);
        const [generatedHistory, setGeneratedHistory] = useState<string[]>([]);
        const latestRequestIdRef = useRef(0);
        const latestEditableValueRef = useRef(value);
        const editableLabelRef = useRef<HTMLDivElement>(null);
        const submitFrameRef = useRef<number | null>(null);
        const generateButtonRef = useRef<HTMLButtonElement>(null);
        const undoButtonRef = useRef<HTMLButtonElement>(null);

        const isActionButtonFocused = useCallback(() => {
            const activeElement = document.activeElement;
            return activeElement === generateButtonRef.current || activeElement === undoButtonRef.current;
        }, []);

        const setEditableLabelRefs = useCallback(
            (node: HTMLDivElement | null) => {
                editableLabelRef.current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref],
        );

        useEffect(() => {
            if (!isEditing) {
                latestEditableValueRef.current = value;
            }
        }, [isEditing, value]);

        useEffect(() => {
            return () => {
                if (submitFrameRef.current !== null) {
                    cancelAnimationFrame(submitFrameRef.current);
                }
                latestRequestIdRef.current += 1;
            };
        }, []);

        useEffect(() => {
            if (generationKey > 0) {
                editableLabelRef.current?.focus();
            }
        }, [generationKey]);

        const handleActionMouseDown = useCallback((event: ReactMouseEvent<HTMLElement>) => {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
        }, []);

        const handleEditingStart = useCallback(() => {
            setIsEditing(true);
            onEditingStart?.();
        }, [onEditingStart]);

        const handleCancel = useCallback(
            (cancelledValue: string) => {
                latestEditableValueRef.current = cancelledValue;
                onCancel?.(cancelledValue);

                if (submitFrameRef.current !== null) {
                    cancelAnimationFrame(submitFrameRef.current);
                }

                submitFrameRef.current = requestAnimationFrame(() => {
                    submitFrameRef.current = null;
                    setIsEditing(isActionButtonFocused());
                });
            },
            [isActionButtonFocused, onCancel],
        );

        const handleSubmit = useCallback(
            (submittedValue: string) => {
                latestEditableValueRef.current = submittedValue;
                onSubmit(submittedValue);

                if (submitFrameRef.current !== null) {
                    cancelAnimationFrame(submitFrameRef.current);
                }

                submitFrameRef.current = requestAnimationFrame(() => {
                    submitFrameRef.current = null;
                    setIsEditing(isActionButtonFocused());
                });
            },
            [isActionButtonFocused, onSubmit],
        );

        const handleChange = useCallback(
            (changedValue: string) => {
                latestEditableValueRef.current = changedValue;
                onChange?.(changedValue);
            },
            [onChange],
        );

        const handleGenerate = useCallback(() => {
            const valueBeforeGenerate = latestEditableValueRef.current;
            const requestId = latestRequestIdRef.current + 1;
            latestRequestIdRef.current = requestId;

            setIsGenerating(true);

            void Promise.resolve()
                .then(onGenerate)
                .then((result) => {
                    if (latestRequestIdRef.current !== requestId) {
                        return;
                    }

                    const rawGeneratedValue = result.text ?? "";
                    const generatedValue =
                        rawGeneratedValue.trim() === "" ? valueBeforeGenerate : rawGeneratedValue;

                    setIsGenerating(false);

                    if (generatedValue === valueBeforeGenerate) {
                        return;
                    }

                    setGeneratedHistory((currentHistory) => [...currentHistory, valueBeforeGenerate]);
                    latestEditableValueRef.current = generatedValue;
                    onSubmit(generatedValue);
                    setIsEditing(false);
                    setGenerationKey((currentValue) => currentValue + 1);
                })
                .catch((error: unknown) => {
                    if (latestRequestIdRef.current !== requestId) {
                        return;
                    }

                    setIsGenerating(false);
                    const normalizedError =
                        error instanceof Error ? error : new Error("Failed to generate text.");
                    onGenerateError?.(normalizedError);
                });
        }, [onGenerate, onGenerateError, onSubmit]);

        const handleGenerateMouseDown = useCallback(
            (event: ReactMouseEvent<HTMLElement>) => {
                handleActionMouseDown(event);
                handleGenerate();
            },
            [handleActionMouseDown, handleGenerate],
        );

        const handleGenerateClick = useCallback(
            (event: ReactMouseEvent<HTMLButtonElement>) => {
                // Mouse click is already handled on mousedown to avoid EditableLabel blur race.
                if (event.detail !== 0) {
                    return;
                }
                handleGenerate();
            },
            [handleGenerate],
        );

        const handleUndo = useCallback(() => {
            const valueToRestore = generatedHistory[generatedHistory.length - 1];
            if (valueToRestore === undefined) {
                return;
            }

            setGeneratedHistory(generatedHistory.slice(0, -1));
            latestEditableValueRef.current = valueToRestore;
            onSubmit(valueToRestore);
            setIsEditing(false);
            setGenerationKey((currentValue) => currentValue + 1);
            onUndo?.();
        }, [generatedHistory, onSubmit, onUndo]);

        const handleUndoMouseDown = useCallback(
            (event: ReactMouseEvent<HTMLElement>) => {
                handleActionMouseDown(event);
                handleUndo();
            },
            [handleActionMouseDown, handleUndo],
        );

        const handleUndoClick = useCallback(
            (event: ReactMouseEvent<HTMLButtonElement>) => {
                // Mouse click is already handled on mousedown to avoid EditableLabel blur race.
                if (event.detail !== 0) {
                    return;
                }
                handleUndo();
            },
            [handleUndo],
        );

        const handleContainerBlur = useCallback((event: ReactFocusEvent<HTMLDivElement>) => {
            const currentTarget = event.currentTarget;
            requestAnimationFrame(() => {
                if (!currentTarget.contains(document.activeElement)) {
                    setIsEditing(false);
                }
            });
        }, []);

        const isGenerated = generatedHistory.length > 0;
        const isGenerateVisible = !isGenerating && isEditing;
        const isUndoVisible = !isGenerating && isEditing && isGenerated;
        const hasMultipleActions = isGenerateVisible && isUndoVisible;
        const spinnerLabel = generatingLabel ?? generateButtonLabel;

        return (
            <div
                className={b({ isEditing, isGenerating, isGenerated, hasMultipleActions })}
                data-testid={dataTestId}
                onBlur={handleContainerBlur}
            >
                <EditableLabel
                    key={generationKey}
                    ref={setEditableLabelRefs}
                    value={value}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onEditingStart={handleEditingStart}
                    onChange={handleChange}
                    {...editableLabelProps}
                />
                {isGenerating ? (
                    <div className={e("action")}>
                        <UiTooltip
                            triggerBy={["hover"]}
                            anchor={
                                <span className={e("spinner")} aria-label={spinnerLabel}>
                                    <span className="gd-spinner small" />
                                </span>
                            }
                            content={spinnerLabel}
                        />
                    </div>
                ) : null}
                {isGenerateVisible || isUndoVisible ? (
                    <div className={e("action", { hasMultipleActions })}>
                        {isUndoVisible ? (
                            <div onMouseDown={handleUndoMouseDown}>
                                <UiTooltip
                                    triggerBy={["hover", "focus"]}
                                    anchor={
                                        <UiIconButton
                                            ref={undoButtonRef}
                                            icon="undo"
                                            size="xsmall"
                                            variant="tertiary"
                                            dataTestId={undoButtonDataTestId}
                                            label={undoButtonLabel}
                                            onClick={handleUndoClick}
                                        />
                                    }
                                    content={undoButtonLabel}
                                />
                            </div>
                        ) : null}
                        {isGenerateVisible ? (
                            <div onMouseDown={handleGenerateMouseDown}>
                                <UiTooltip
                                    triggerBy={["hover", "focus"]}
                                    anchor={
                                        <UiIconButton
                                            ref={generateButtonRef}
                                            icon="ai"
                                            size="xsmall"
                                            variant="tertiary"
                                            dataTestId={generateButtonDataTestId}
                                            label={generateButtonLabel}
                                            onClick={handleGenerateClick}
                                        />
                                    }
                                    content={generateButtonLabel}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    },
);

UiInlineTextGenerator.displayName = "UiInlineTextGenerator";
