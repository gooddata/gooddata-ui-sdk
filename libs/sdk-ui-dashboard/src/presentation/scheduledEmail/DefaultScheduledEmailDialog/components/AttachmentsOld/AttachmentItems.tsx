// (C) 2024-2025 GoodData Corporation

import { KeyboardEvent, useCallback, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { IExportDefinitionVisualizationObjectSettings } from "@gooddata/sdk-model";
import {
    Button,
    ContentDivider,
    Dropdown,
    IAlignPoint,
    OverlayPositionType,
    isEscapeKey,
    isSpaceKey,
} from "@gooddata/sdk-ui-kit";

import { OldAttachmentType, OldWidgetAttachmentType } from "../../types.js";

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

function AttachmentItem({
    format,
    checked,
    onChange,
    className,
    disabled,
}: {
    id?: string;
    format: OldAttachmentType;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    className?: string;
}) {
    const intl = useIntl();
    const handleKeyDown = (e: KeyboardEvent) => {
        if (disabled) {
            return;
        }

        if (isSpaceKey(e)) {
            e.preventDefault();
            onChange();
        }
    };
    return (
        <label className="gd-notifications-channels-attachment-checkbox input-checkbox-label">
            <input
                type="checkbox"
                className="input-checkbox"
                disabled={disabled}
                checked={checked}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                aria-label={intl.formatMessage(
                    { id: "dialogs.schedule.management.attachments.attachment" },
                    { format: format },
                )}
            />
            <span className="input-label-text" />
            <div className={cx("gd-attachment-item", `s-attachment-item-${format.toLowerCase()}`, className)}>
                <span className="gd-attachment-item-format">{format}</span>
            </div>
        </label>
    );
}

export function AttachmentDashboard(props: {
    pdfSelected: boolean;
    disabled?: boolean;
    onSelectionChange: () => void;
}) {
    const { pdfSelected, disabled, onSelectionChange } = props;

    return (
        <AttachmentItem format="PDF" disabled={disabled} checked={pdfSelected} onChange={onSelectionChange} />
    );
}

export function AttachmentWidgets(props: {
    csvSelected: boolean;
    xlsxSelected: boolean;
    settings: IExportDefinitionVisualizationObjectSettings;
    onSelectionChange: (format: OldWidgetAttachmentType) => void;
    onSettingsChange: (obj: IExportDefinitionVisualizationObjectSettings) => void;
    closeOnParentScroll?: boolean;
    overlayPositionType?: OverlayPositionType;
}) {
    const {
        csvSelected,
        xlsxSelected,
        settings,
        onSelectionChange,
        onSettingsChange,
        closeOnParentScroll,
        overlayPositionType,
    } = props;
    const intl = useIntl();
    const [mergeHeaders, setMergeHeaders] = useState(settings.mergeHeaders);

    const handleInputKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isSpaceKey(e)) {
                e.preventDefault();
                setMergeHeaders(!mergeHeaders);
            }
        },
        [setMergeHeaders, mergeHeaders],
    );

    return (
        <>
            <AttachmentItem format="CSV" checked={csvSelected} onChange={() => onSelectionChange("CSV")} />
            <AttachmentItem
                format="XLSX"
                checked={xlsxSelected}
                onChange={() => onSelectionChange("XLSX")}
                className="gd-attachment-item-format-with-configuration"
            />
            <Dropdown
                closeOnParentScroll={closeOnParentScroll}
                overlayPositionType={overlayPositionType}
                alignPoints={DROPDOWN_ALIGN_POINTS}
                autofocusOnOpen
                renderButton={({ toggleDropdown, buttonRef }) => (
                    <Button
                        className="gd-attachment-item-configuration gd-icon-settings"
                        onClick={toggleDropdown}
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage({
                                id: "dialogs.schedule.management.attachments.xlsx.settings",
                            }),
                        }}
                        ref={buttonRef}
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
                                    onKeyDown={handleInputKeyDown}
                                    checked={mergeHeaders}
                                />
                                <span className="input-label-text">
                                    <FormattedMessage id="dialogs.schedule.management.attachments.cells.merged" />
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
                                    onSettingsChange({ mergeHeaders });
                                    closeDropdown();
                                }}
                                disabled={mergeHeaders === settings.mergeHeaders}
                            />
                        </div>
                    </div>
                )}
            />
        </>
    );
}
