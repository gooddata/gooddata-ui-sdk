// (C) 2024-2025 GoodData Corporation

import React, { RefObject, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { DashboardAttachmentType, WidgetAttachmentType } from "@gooddata/sdk-model";
import {
    Button,
    ContentDivider,
    Dropdown,
    IAlignPoint,
    Message,
    UiIconButton,
    isEscapeKey,
} from "@gooddata/sdk-ui-kit";

export const widgetAttachmentLabels: Record<WidgetAttachmentType, React.ReactNode> = {
    PNG: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.png" />,
    PPTX: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.pptx" />,
    PDF: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.pdf" />,
    XLSX: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.formattedXLSX" />,
    CSV: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.formattedCSV" />,
    CSV_RAW: <FormattedMessage id="scheduledEmail.attachmentFormat.widget.rawCSV" />,
    HTML: "",
};

export const dashboardAttachmentLabels: Record<DashboardAttachmentType, React.ReactNode> = {
    PPTX: <FormattedMessage id="scheduledEmail.attachmentFormat.dashboard.pptx" />,
    PDF: <FormattedMessage id="scheduledEmail.attachmentFormat.dashboard.pdf" />,
    XLSX: <FormattedMessage id="scheduledEmail.attachmentFormat.dashboard.formattedXLSX" />,
    PDF_SLIDES: <FormattedMessage id="scheduledEmail.attachmentFormat.dashboard.pdfSlides" />,
};

export const attachmentIcons: Record<WidgetAttachmentType | DashboardAttachmentType, string> = {
    PNG: "gd-icon-type-image",
    PPTX: "gd-icon-type-slides",
    PDF: "gd-icon-type-pdf",
    XLSX: "gd-icon-type-sheet",
    CSV: "gd-icon-type-csv-formatted",
    CSV_RAW: "gd-icon-type-csv-raw",
    PDF_SLIDES: "gd-icon-type-pdf",
    HTML: "",
};

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bc tc",
        offset: { x: 0, y: 0 },
    },
    {
        align: "tc bc",
        offset: { x: 0, y: 0 },
    },
];

type AttachmentItem<T extends WidgetAttachmentType | DashboardAttachmentType> = {
    type: T;
    selected: boolean;
};

interface AttachmentsSelectProps<T extends WidgetAttachmentType | DashboardAttachmentType> {
    attachments: AttachmentItem<T>[];
    onChange: (attachments: AttachmentItem<T>[]) => void;
    mode: "widget" | "dashboard";
}

export function AttachmentsSelect<T extends WidgetAttachmentType | DashboardAttachmentType>({
    attachments: initialAttachments,
    onChange,
    mode,
}: AttachmentsSelectProps<T>) {
    const [attachments, setAttachments] = useState<AttachmentItem<T>[]>(initialAttachments);
    const intl = useIntl();

    const handleFormatChange = (format: T) => {
        setAttachments(
            attachments.map((item) => (item.type === format ? { ...item, selected: !item.selected } : item)),
        );
    };

    const isSomeSelected = attachments.some((item) => item.selected);

    const isDirty = !areAttachmentsEqual<T>(attachments, initialAttachments);

    return (
        <>
            <Dropdown
                closeOnParentScroll
                overlayPositionType="sameAsTarget"
                alignPoints={DROPDOWN_ALIGN_POINTS}
                autofocusOnOpen={true}
                onOpenStateChanged={(isOpen) => {
                    if (!isOpen) {
                        setAttachments(initialAttachments);
                    }
                }}
                renderButton={({ toggleDropdown, buttonRef }) => (
                    <UiIconButton
                        icon="plus"
                        label={intl.formatMessage({
                            id: "dialogs.automation.filters.add",
                        })}
                        onClick={toggleDropdown}
                        variant="popout"
                        ref={buttonRef as RefObject<HTMLButtonElement>}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <div
                        className="gd-attachment-settings-dropdown"
                        onKeyDown={(e) => {
                            if (isEscapeKey(e)) {
                                e.stopPropagation();
                                closeDropdown();
                            }
                        }}
                    >
                        <div className="gd-list-title">
                            <FormattedMessage id="dialogs.schedule.management.attachments.title" />
                            <div className="gd-close-button">
                                <Button
                                    className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                                    value=""
                                    onClick={closeDropdown}
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage({ id: "close" }),
                                    }}
                                />
                            </div>
                        </div>
                        <div className="gd-attachment-types-content">
                            {attachments.map((item) => (
                                <div className="gd-attachment-type-item" key={item.type}>
                                    <label className="input-checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="input-checkbox"
                                            checked={item.selected}
                                            onChange={() => handleFormatChange(item.type)}
                                        />
                                        <span className="input-label-text">
                                            <span
                                                className={`gd-attachment-type-label ${
                                                    attachmentIcons[item.type]
                                                }`}
                                            >
                                                {mode === "widget"
                                                    ? widgetAttachmentLabels[item.type]
                                                    : dashboardAttachmentLabels[item.type]}
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            ))}
                            {!isSomeSelected && (
                                <Message type="warning">
                                    <FormattedMessage
                                        id="scheduledEmail.attachments.warning.noAttachmentsSelected"
                                        values={{
                                            strong: (chunks) => <strong>{chunks}</strong>,
                                        }}
                                    />
                                </Message>
                            )}
                        </div>
                        <ContentDivider className="gd-divider-without-margin" />
                        <div className="gd-attachment-settings-dropdown-footer">
                            <Button
                                value={intl.formatMessage({ id: "cancel" })}
                                className="gd-button-secondary"
                                onClick={closeDropdown}
                            />
                            <Button
                                value={intl.formatMessage({ id: "save" })}
                                className="gd-button-action"
                                onClick={() => {
                                    onChange(attachments);
                                    closeDropdown();
                                }}
                                disabled={!isSomeSelected || !isDirty}
                            />
                        </div>
                    </div>
                )}
            />
        </>
    );
}

const areAttachmentsEqual = <T extends WidgetAttachmentType | DashboardAttachmentType>(
    a: AttachmentItem<T>[],
    b: AttachmentItem<T>[],
) => {
    const aSelected = a
        .filter((item) => item.selected)
        .map((item) => item.type)
        .sort();
    const bSelected = b
        .filter((item) => item.selected)
        .map((item) => item.type)
        .sort();
    if (aSelected.length !== bSelected.length) return false;
    return aSelected.every((type, idx) => type === bSelected[idx]);
};
