// (C) 2025 GoodData Corporation
import React, { useState } from "react";
import {
    WidgetAttachmentType,
    DashboardAttachmentType,
    IExportDefinitionVisualizationObjectSettings,
} from "@gooddata/sdk-model";
import { Button, ContentDivider, Dropdown, IAlignPoint, isEscapeKey, UiIcon } from "@gooddata/sdk-ui-kit";
import { attachmentIcons, dashboardAttachmentLabels, widgetAttachmentLabels } from "./AttachmentsSelect.js";
import { FormattedMessage, useIntl } from "react-intl";

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

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

export function AttachmentsList<T extends WidgetAttachmentType | DashboardAttachmentType>({
    attachments,
    onDelete,
    xlsxSettings,
    onXlsxSettingsChange,
    mode,
}: {
    attachments: T[];
    onDelete: (attachment: T) => void;
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    mode: "widget" | "dashboard";
}) {
    const intl = useIntl();
    const [mergeHeaders, setMergeHeaders] = useState(xlsxSettings.mergeHeaders ?? true);
    const [exportInfo, setExportInfo] = useState(xlsxSettings.exportInfo ?? true);

    const isSettingsDirty =
        mergeHeaders !== (xlsxSettings.mergeHeaders ?? true) ||
        exportInfo !== (xlsxSettings.exportInfo ?? true);

    return (
        <>
            {attachments.map((attachment) => (
                <div className="gd-attachment-chip" key={attachment}>
                    <span className={`gd-attachment-chip-label ${attachmentIcons[attachment]}`}>
                        {mode === "widget"
                            ? widgetAttachmentLabels[attachment]
                            : dashboardAttachmentLabels[attachment]}
                    </span>
                    {attachment === "XLSX" && (
                        <Dropdown
                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                            overlayPositionType={OVERLAY_POSITION_TYPE}
                            alignPoints={DROPDOWN_ALIGN_POINTS}
                            autofocusOnOpen={true}
                            onOpenStateChanged={(isOpen) => {
                                if (!isOpen) {
                                    setMergeHeaders(xlsxSettings.mergeHeaders ?? true);
                                    setExportInfo(xlsxSettings.exportInfo ?? true);
                                }
                            }}
                            renderButton={({ toggleDropdown, buttonRef }) => (
                                <button
                                    className="gd-attachment-chip-button"
                                    onClick={toggleDropdown}
                                    ref={buttonRef as React.Ref<HTMLButtonElement>}
                                    aria-label={intl.formatMessage({
                                        id: "dialogs.schedule.management.attachments.xlsx.settings",
                                    })}
                                >
                                    <UiIcon type="settings" size={14} color="complementary-8" />
                                </button>
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
                                        <FormattedMessage id="dialogs.schedule.management.attachments.xlsx.settings" />
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
                                    <div className="gd-attachment-settings-dropdown-content">
                                        <label className="input-checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="input-checkbox"
                                                onChange={() => setMergeHeaders(!mergeHeaders)}
                                                checked={mergeHeaders}
                                            />
                                            <span className="input-label-text">
                                                <FormattedMessage id="dialogs.schedule.management.attachments.cells.merged" />
                                            </span>
                                        </label>
                                        <label className="input-checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="input-checkbox"
                                                onChange={() => setExportInfo(!exportInfo)}
                                                checked={exportInfo}
                                            />
                                            <span className="input-label-text">
                                                <FormattedMessage id="dialogs.schedule.management.attachments.exportInfo" />
                                            </span>
                                        </label>
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
                                                onXlsxSettingsChange({
                                                    mergeHeaders,
                                                    exportInfo,
                                                });
                                                closeDropdown();
                                            }}
                                            disabled={!isSettingsDirty}
                                        />
                                    </div>
                                </div>
                            )}
                        />
                    )}
                    <button
                        className="gd-attachment-chip-button gd-attachment-chip-delete"
                        onClick={() => onDelete(attachment)}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            fill="currentColor"
                        >
                            <path d="M10.7031 10.0049L16.3574 15.6494C16.4551 15.7471 16.5039 15.8643 16.5039 16.001C16.5039 16.1377 16.4551 16.2549 16.3574 16.3525C16.3053 16.4046 16.2467 16.4437 16.1816 16.4697C16.123 16.4893 16.0612 16.499 15.9961 16.499C15.9375 16.499 15.8757 16.4893 15.8105 16.4697C15.752 16.4437 15.6966 16.4046 15.6445 16.3525L10 10.708L4.35547 16.3525C4.30339 16.4046 4.24479 16.4437 4.17969 16.4697C4.12109 16.4893 4.0625 16.499 4.00391 16.499C3.9388 16.499 3.8737 16.4893 3.80859 16.4697C3.75 16.4437 3.69466 16.4046 3.64258 16.3525C3.54492 16.2549 3.49609 16.1377 3.49609 16.001C3.49609 15.8643 3.54492 15.7471 3.64258 15.6494L9.29688 10.0049L3.64258 4.35059C3.54492 4.25293 3.49609 4.13574 3.49609 3.99902C3.49609 3.8623 3.54492 3.74512 3.64258 3.64746C3.74023 3.5498 3.85742 3.50098 3.99414 3.50098C4.13737 3.50098 4.25781 3.5498 4.35547 3.64746L10 9.29199L15.6445 3.64746C15.7422 3.5498 15.8594 3.50098 15.9961 3.50098C16.1393 3.50098 16.2598 3.5498 16.3574 3.64746C16.4551 3.74512 16.5039 3.8623 16.5039 3.99902C16.5039 4.13574 16.4551 4.25293 16.3574 4.35059L10.7031 10.0049Z"></path>
                        </svg>
                    </button>
                </div>
            ))}
        </>
    );
}
