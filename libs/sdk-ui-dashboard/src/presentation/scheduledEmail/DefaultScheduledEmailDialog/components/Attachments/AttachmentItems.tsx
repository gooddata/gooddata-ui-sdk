// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import cx from "classnames";
import { Button, ContentDivider, Dropdown, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { AttachmentType, WidgetAttachmentType } from "../../types.js";
import { FormattedMessage, useIntl } from "react-intl";
import { IExportDefinitionVisualizationObjectSettings } from "@gooddata/sdk-model";

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

const AttachmentItem: React.FC<{
    format: AttachmentType;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    className?: string;
}> = ({ format, checked, onChange, className, disabled }) => (
    <label className="gd-notifications-channels-attachment-checkbox input-checkbox-label">
        <input
            type="checkbox"
            className="input-checkbox"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
        />
        <span className="input-label-text" />
        <div
            aria-label="attachment"
            className={cx("gd-attachment-item", `s-attachment-item-${format.toLowerCase()}`, className)}
        >
            <span className="gd-attachment-item-format">{format}</span>
        </div>
    </label>
);

export const AttachmentDashboard: React.FC<{
    pdfSelected: boolean;
    disabled?: boolean;
    onSelectionChange: () => void;
}> = (props) => {
    const { pdfSelected, disabled, onSelectionChange } = props;

    return (
        <AttachmentItem format="PDF" disabled={disabled} checked={pdfSelected} onChange={onSelectionChange} />
    );
};

export const AttachmentWidgets: React.FC<{
    csvSelected: boolean;
    xlsxSelected: boolean;
    settings: IExportDefinitionVisualizationObjectSettings;
    onSelectionChange: (format: WidgetAttachmentType) => void;
    onSettingsChange: (obj: IExportDefinitionVisualizationObjectSettings) => void;
}> = (props) => {
    const { csvSelected, xlsxSelected, settings, onSelectionChange, onSettingsChange } = props;
    const intl = useIntl();
    const [mergeHeaders, setMergeHeaders] = useState(settings.mergeHeaders);

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
                alignPoints={DROPDOWN_ALIGN_POINTS}
                renderButton={({ toggleDropdown }) => (
                    <span
                        className="gd-attachment-item-configuration gd-icon-settings"
                        onClick={toggleDropdown}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <div className="gd-attachment-settings-dropdown">
                        <div className="gd-list-title">
                            <FormattedMessage id="dialogs.schedule.management.attachments.xlsx.settings" />
                            <div className="gd-close-button">
                                <Button
                                    className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                                    value=""
                                    onClick={closeDropdown}
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
};
