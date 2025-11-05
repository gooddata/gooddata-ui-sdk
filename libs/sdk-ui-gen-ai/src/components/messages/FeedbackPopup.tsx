// (C) 2024-2025 GoodData Corporation

import { ReactElement, useState } from "react";

import { useIntl } from "react-intl";

import { UiButton, UiCheckbox, UiPopover } from "@gooddata/sdk-ui-kit";

export interface IFeedbackPopupProps {
    anchor: ReactElement<any>;
    onSubmit?: (feedback: IFeedbackData) => void;
}

export interface IFeedbackData {
    reason: string;
    description: string;
}

/**
 * @internal
 */
export function FeedbackPopup({ anchor, onSubmit }: IFeedbackPopupProps) {
    const intl = useIntl();
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [description, setDescription] = useState("");

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
            setSelectedReason(reasonId);
            // Clear description if switching away from "other"
            if (selectedReason === "other" && reasonId !== "other") {
                setDescription("");
            }
        } else {
            setSelectedReason("");
            // Clear description when unchecking "other"
            if (reasonId === "other") {
                setDescription("");
            }
        }
    };

    const handleCancel = (onClose: () => void) => {
        setSelectedReason("");
        setDescription("");
        onClose();
    };

    const handleSubmit = (onClose: () => void) => {
        onSubmit?.({
            reason: selectedReason,
            description,
        });
        handleCancel(onClose);
    };

    return (
        <UiPopover
            anchor={anchor}
            title={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.title" })}
            closeVisible
            closeText={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.close" })}
            width={260}
            content={() => (
                <div className="gd-gen-ai-feedback-popup__body">
                    <div className="gd-gen-ai-feedback-popup__section">
                        <label className="gd-gen-ai-feedback-popup__section-label">
                            {intl.formatMessage({ id: "gd.gen-ai.feedback.popup.reasons-label" })}
                        </label>
                        <div className="gd-gen-ai-feedback-popup__checkboxes">
                            {feedbackReasons.map((reason) => (
                                <UiCheckbox
                                    key={reason.id}
                                    label={reason.label}
                                    checked={selectedReason === reason.id}
                                    onChange={(e) => handleReasonChange(reason.id, e.target.checked)}
                                />
                            ))}
                        </div>
                    </div>

                    {selectedReason === "other" && (
                        <div className="gd-gen-ai-feedback-popup__section">
                            <label
                                htmlFor="feedback-description"
                                className="gd-gen-ai-feedback-popup__section-label"
                            >
                                {intl.formatMessage({ id: "gd.gen-ai.feedback.popup.description-label" })}
                            </label>
                            <textarea
                                id="feedback-description"
                                className="gd-gen-ai-feedback-popup__textarea gd-input-field"
                                rows={4}
                                placeholder={intl.formatMessage({
                                    id: "gd.gen-ai.feedback.popup.description-placeholder",
                                })}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                    />
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.feedback.popup.send" })}
                        variant="primary"
                        isDisabled={!selectedReason}
                        onClick={() => handleSubmit(onClose)}
                    />
                </>
            )}
        />
    );
}
