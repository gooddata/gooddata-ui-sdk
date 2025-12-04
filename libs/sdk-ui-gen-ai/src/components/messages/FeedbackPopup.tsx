// (C) 2024-2025 GoodData Corporation

import { ReactElement, useState } from "react";

import { useIntl } from "react-intl";

import { EditableLabel, UiButton, UiCheckbox, UiPopover, useIdPrefixed } from "@gooddata/sdk-ui-kit";

export interface IFeedbackPopupProps {
    anchor: (opened: boolean) => ReactElement<any>;
    onSubmit?: (feedback: IFeedbackData) => void;
}

export interface IFeedbackData {
    reason: string[];
    description: string;
}

/**
 * @internal
 */
export function FeedbackPopup({ anchor, onSubmit }: IFeedbackPopupProps) {
    const intl = useIntl();
    const [opened, setOpened] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const textareaWrapperId = useIdPrefixed("feedback-textarea-wrapper");
    const textareaId = useIdPrefixed("feedback-textarea");

    const feedbackReasons = [
        {
            id: "forgot-context",
            label: intl.formatMessage({ id: "gd.gen-ai.feedback.reason.forgot-context" }),
        },
        {
            id: "ignored-instructions",
            label: intl.formatMessage({ id: "gd.gen-ai.feedback.reason.ignored-instructions" }),
        },
        {
            id: "factually-incorrect",
            label: intl.formatMessage({ id: "gd.gen-ai.feedback.reason.factually-incorrect" }),
        },
        {
            id: "other",
            label: intl.formatMessage({ id: "gd.gen-ai.feedback.reason.other" }),
        },
    ];

    const handleReasonChange = (reasonId: string, checked: boolean) => {
        if (checked) {
            setSelectedReasons((prev) => [...prev, reasonId]);
        } else {
            setSelectedReasons((prev) => prev.filter((id) => id !== reasonId));
            // Clear description when unchecking "other"
            if (reasonId === "other") {
                setDescription("");
            }
        }
    };

    const handleCancel = (onClose?: () => void) => {
        setSelectedReasons([]);
        setDescription("");
        setOpened(false);
        onClose?.();
    };

    const handleSubmit = (onClose: () => void) => {
        onSubmit?.({
            reason: selectedReasons,
            description,
        });
        handleCancel(onClose);
    };

    return (
        <UiPopover
            anchor={anchor(opened)}
            title={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.title" })}
            closeVisible
            closeText={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.close" })}
            width={260}
            enableFocusTrap
            onClose={() => {
                handleCancel();
            }}
            onOpen={() => {
                setOpened(true);
            }}
            content={() => (
                <div className="gd-gen-ai-feedback-popup__body">
                    <div className="gd-gen-ai-feedback-popup__section">
                        <fieldset>
                            <legend className="gd-label gd-gen-ai-feedback-popup__legend">
                                {intl.formatMessage({ id: "gd.gen-ai.feedback.popup.reasons-label" })}
                            </legend>
                            <div className="gd-gen-ai-feedback-popup__checkboxes">
                                {feedbackReasons.map((reason) => (
                                    <UiCheckbox
                                        key={reason.id}
                                        label={reason.label}
                                        checked={selectedReasons.includes(reason.id)}
                                        onChange={(e) => handleReasonChange(reason.id, e.target.checked)}
                                        accessibilityConfig={
                                            reason.id === "other"
                                                ? {
                                                      ariaControls: textareaWrapperId,
                                                      ariaExpanded: selectedReasons.includes("other")
                                                          ? "true"
                                                          : "false",
                                                  }
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    {selectedReasons.includes("other") && (
                        <div id={textareaWrapperId} className="gd-gen-ai-feedback-popup__section">
                            <label className="gd-label" htmlFor={textareaId}>
                                {intl.formatMessage({
                                    id: "gd.gen-ai.feedback.popup.description-label",
                                })}
                            </label>
                            <EditableLabel
                                autofocus
                                value={description}
                                onChange={setDescription}
                                onSubmit={setDescription}
                                maxRows={4}
                                className="gd-label gd-gen-ai-feedback-popup__textarea"
                                id={textareaId}
                            />
                        </div>
                    )}
                </div>
            )}
            footer={({ onClose }) => (
                <>
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.cancel" })}
                        variant="secondary"
                        onClick={() => handleCancel(onClose)}
                        size="small"
                    />
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.send" })}
                        variant="primary"
                        isDisabled={false}
                        onClick={() => handleSubmit(onClose)}
                        size="small"
                    />
                </>
            )}
        />
    );
}
