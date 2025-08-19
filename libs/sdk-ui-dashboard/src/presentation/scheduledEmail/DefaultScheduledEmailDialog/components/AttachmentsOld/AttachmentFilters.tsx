// (C) 2024-2025 GoodData Corporation

import React, { useState } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    ContentDivider,
    Dropdown,
    IAlignPoint,
    OverlayPositionType,
} from "@gooddata/sdk-ui-kit";

import { AttachmentFiltersList } from "./AttachmentFiltersList.js";
import { DEFAULT_DROPDOWN_ALIGN_POINTS } from "../../constants.js";
import { IAttachmentFilterInfo } from "../../hooks/useFiltersForDashboardScheduledExportInfo.js";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "cr cl",
        offset: { x: 0, y: -2 },
    },
    {
        align: "cl cr",
        offset: { x: 0, y: -2 },
    },
];

interface IAttachmentFiltersProps {
    filterType: AttachmentFilterType;
    onChange: (type: AttachmentFilterType) => void;
    /**
     * Whole attachment content is hidden
     */
    hidden?: boolean;
    /**
     * We do not allow changing the filter type when disabled
     */
    disabled?: boolean;
    /**
     * Information about attachment filters
     */
    filters?: IAttachmentFilterInfo[];
    /**
     * Position type of the dropdown
     */
    overlayPositionType?: OverlayPositionType;
}

/**
 * edited - ad-hoc changed dashboard filters
 * default - default dashboard filters stored in its filter context definition
 */
export type AttachmentFilterType = "edited" | "default";

const buttonTitle = {
    edited: defineMessage({ id: "dialogs.schedule.management.attachments.filters.edited" }).id,
    default: defineMessage({ id: "dialogs.schedule.management.attachments.filters.default" }).id,
};

export const AttachmentFilters: React.FC<IAttachmentFiltersProps> = (props) => {
    const { filterType, onChange, hidden = false, disabled = false, filters, overlayPositionType } = props;
    const [selectedType, setSelectedType] = useState<AttachmentFilterType>(filterType);
    const intl = useIntl();

    const handleTypeChange = (type: AttachmentFilterType) => {
        if (!disabled) {
            setSelectedType(type);
        }
    };
    const isDefaultDisabled = selectedType !== "default" && disabled;
    const defaultFiltersTooltipMessage = isDefaultDisabled
        ? defineMessage({
              id: "dialogs.schedule.management.attachments.filters.item.tooltip.disabled",
          })
        : defineMessage({ id: "dialogs.schedule.management.attachments.filters.item.tooltip" });

    if (hidden) {
        return null;
    }

    return (
        <Dropdown
            overlayPositionType={overlayPositionType}
            alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
            renderButton={({ toggleDropdown }) => (
                <div className="gd-attachment-filters-dropdown-button">
                    <FormattedMessage id="dialogs.schedule.management.attachments.filters.using" />
                    <Button
                        className="gd-button-link-dimmed s-attachment-filters-dropdown-button"
                        value={intl.formatMessage({ id: buttonTitle[filterType] })}
                        onClick={toggleDropdown}
                    />
                </div>
            )}
            renderBody={({ closeDropdown }) => (
                <div className="gd-attachment-filters-dropdown">
                    <div className="gd-list-title">
                        <FormattedMessage id="dialogs.schedule.management.attachments.filters.title" />
                        <div className="gd-close-button">
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                                value=""
                                onClick={closeDropdown}
                            />
                        </div>
                    </div>
                    <div className="gd-attachment-filters-dropdown-content">
                        <label className="input-radio-label">
                            <input
                                type="radio"
                                className="input-radio"
                                name="filterType"
                                onChange={() => handleTypeChange("edited")}
                                checked={selectedType === "edited"}
                                disabled={selectedType !== "edited" && disabled}
                            />
                            <span className="input-label-text">
                                <FormattedMessage id="dialogs.schedule.management.attachments.filters.item.edited" />
                            </span>
                        </label>
                        <AttachmentFiltersList filters={filters} />
                        <label className="input-radio-label">
                            <input
                                type="radio"
                                className="input-radio"
                                name="filterType"
                                onChange={() => handleTypeChange("default")}
                                checked={selectedType === "default"}
                                disabled={isDefaultDisabled}
                            />
                            <span className="input-label-text">
                                <FormattedMessage id="dialogs.schedule.management.attachments.filters.item.default" />
                                <BubbleHoverTrigger>
                                    <span className="gd-icon-circle-question" />
                                    <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                                        <FormattedMessage id={defaultFiltersTooltipMessage.id} />
                                    </Bubble>
                                </BubbleHoverTrigger>
                            </span>
                        </label>
                    </div>
                    <ContentDivider className="gd-divider-without-margin" />
                    <div className="gd-attachment-filters-dropdown-footer">
                        <Button
                            value={intl.formatMessage({ id: "cancel" })}
                            className="gd-button-secondary"
                            onClick={closeDropdown}
                        />
                        <Button
                            value={intl.formatMessage({ id: "save" })}
                            className="gd-button-action"
                            onClick={() => {
                                onChange(selectedType);
                                closeDropdown();
                            }}
                            disabled={selectedType === filterType}
                        />
                    </div>
                </div>
            )}
        />
    );
};
