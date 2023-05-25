// (C) 2022 GoodData Corporation
import * as React from "react";
import { useCallback, useState } from "react";
import { Dropdown, DropdownButton, DropdownList, SingleSelectListItem, Icon } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { ScheduleDropdown } from "./ScheduleDropdown.js";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { IWidgetExportConfiguration, WidgetExportFileFormat } from "../../interfaces.js";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX } from "../../constants.js";

const ICON_SIZE_BUTTON = 18;
const DROPDOWN_WIDTH = 70;

export interface IFormatOptionsDropdownProps {
    format: WidgetExportFileFormat;
    mergeHeaders: boolean;
    includeFilters: boolean;
    onApply: (result: IWidgetExportConfiguration) => void;
}

export const FormatOptionsDropdown: React.FC<IFormatOptionsDropdownProps> = (props) => {
    const { onApply } = props;
    const intl = useIntl();
    const theme = useTheme();

    const FORMAT_VALUES: WidgetExportFileFormat[] = ["csv", "xlsx"];

    const [format, setFormat] = useState(props.format);
    const [mergeHeaders, setMergeHeaders] = useState(props.mergeHeaders);
    const [includeFilters, setIncludeFilters] = useState(props.includeFilters);

    const canApply =
        format !== props.format ||
        mergeHeaders !== props.mergeHeaders ||
        includeFilters !== props.includeFilters;

    const handleOnApply = useCallback(
        () =>
            onApply({
                format,
                mergeHeaders,
                includeFilters,
            }),
        [format, mergeHeaders, includeFilters, onApply],
    );

    const handleOnCancel = useCallback(() => {
        setFormat(props.format);
        setMergeHeaders(props.mergeHeaders);
        setIncludeFilters(props.includeFilters);
    }, [props.format, props.mergeHeaders, props.includeFilters]);

    const renderBodyContentSelector = () => {
        return (
            <div className="gd-format-options-dropdown-selector">
                <span className="input-label-text">
                    <FormattedMessage id="dialogs.schedule.email.insight.format" />
                </span>
                <div>
                    <Dropdown
                        overlayPositionType="sameAsTarget"
                        className="s-format-options-dropdown"
                        alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
                        overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                        renderButton={({ isOpen, toggleDropdown }) => (
                            <DropdownButton
                                className="s-format-options-format-dropdown-button"
                                value={format.toUpperCase()}
                                isOpen={isOpen}
                                onClick={toggleDropdown}
                            />
                        )}
                        renderBody={({ closeDropdown }) => (
                            <DropdownList
                                width={DROPDOWN_WIDTH}
                                items={FORMAT_VALUES}
                                renderItem={({ item }) => {
                                    return (
                                        <SingleSelectListItem
                                            className="s-format-options-dropdown-content schedule-dropdown-ignore-click"
                                            title={item.toUpperCase()}
                                            onClick={() => {
                                                setFormat(item);
                                                closeDropdown();
                                            }}
                                        />
                                    );
                                }}
                            />
                        )}
                    />
                </div>
            </div>
        );
    };

    const renderBodyContentSelectorOptions = () => {
        return (
            <div className="gd-format-options-dropdown-xlsx">
                <div>
                    <label className="input-checkbox-label">
                        <input
                            type="checkbox"
                            className="input-checkbox s-attachments-merge-headers"
                            checked={mergeHeaders}
                            onChange={(event) => setMergeHeaders(event.target.checked)}
                        />
                        <span className="input-label-text">
                            <FormattedMessage id="dialogs.schedule.email.attribute.merged" />
                        </span>
                    </label>
                </div>
                <div>
                    <label className="input-checkbox-label s-attachments-include-filters">
                        <input
                            type="checkbox"
                            className="input-checkbox"
                            checked={includeFilters}
                            onChange={(event) => setIncludeFilters(event.target.checked)}
                        />
                        <span className="input-label-text">
                            <FormattedMessage id="dialogs.schedule.email.show.filters" />
                        </span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <ScheduleDropdown
            title={intl.formatMessage({ id: "dialogs.schedule.email.format.options" })}
            applyDisabled={!canApply}
            onApply={handleOnApply}
            onCancel={handleOnCancel}
            buttonClassName="s-schedule-format-options-button"
            bodyClassName="s-schedule-format-options-body"
            iconComponent={
                <Icon.SettingsGear
                    color={theme?.palette?.complementary?.c6}
                    width={ICON_SIZE_BUTTON}
                    height={ICON_SIZE_BUTTON}
                />
            }
            contentComponent={
                <div className="gd-format-options-dropdown">
                    {renderBodyContentSelector()}
                    {format === "xlsx" && renderBodyContentSelectorOptions()}
                </div>
            }
        />
    );
};
