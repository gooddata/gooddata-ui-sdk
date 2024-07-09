// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    ContentDivider,
    Dropdown,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { AttachmentFiltersList } from "./AttachmentFiltersList.js";
import { IAttachmentFilterInfo } from "../../hooks/useAttachmentDashboardFilters.js";

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bl tl",
        offset: { x: 0, y: 0 },
    },
    {
        align: "tl bl",
        offset: { x: 0, y: 0 },
    },
];

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
     * Determines whether dropdown is available or not
     */
    useDropdown?: boolean;
    /**
     * Information about attachment filters
     */
    filters?: IAttachmentFilterInfo[];
}

/**
 * edited - ad-hoc changed dashboard filters
 * default - default dashboard filters stored in its filter context definition
 */
export type AttachmentFilterType = "edited" | "default";

const buttonTitle = {
    edited: "dialogs.schedule.management.attachments.filters.edited",
    default: "dialogs.schedule.management.attachments.filters.default",
};

export const AttachmentFilters: React.FC<IAttachmentFiltersProps> = (props) => {
    const { filterType, onChange, hidden = false, disabled = false, useDropdown = true, filters } = props;
    const [selectedType, setSelectedType] = useState<AttachmentFilterType>(filterType);
    const intl = useIntl();

    const handleTypeChange = (type: AttachmentFilterType) => {
        !disabled && setSelectedType(type);
    };

    const filtersButtonValue = intl.formatMessage({ id: buttonTitle[filterType] });
    const filtersUsingMessage = intl.formatMessage({
        id: "dialogs.schedule.management.attachments.filters.using",
    });

    if (hidden) {
        return null;
    }

    return (
        <div>
            {useDropdown ? (
                <Dropdown
                    alignPoints={DROPDOWN_ALIGN_POINTS}
                    renderButton={({ toggleDropdown }) => (
                        <div className="gd-attachment-filters-dropdown-button">
                            {filtersUsingMessage}
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
                                        disabled={selectedType !== "default" && disabled}
                                    />
                                    <span className="input-label-text">
                                        <FormattedMessage id="dialogs.schedule.management.attachments.filters.item.default" />
                                        <BubbleHoverTrigger>
                                            <span className="gd-icon-circle-question" />
                                            <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                                                <FormattedMessage id="dialogs.schedule.management.attachments.filters.item.tooltip" />
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
            ) : (
                <span>
                    {filtersUsingMessage}&nbsp;{filtersButtonValue}
                </span>
            )}
        </div>
    );
};
