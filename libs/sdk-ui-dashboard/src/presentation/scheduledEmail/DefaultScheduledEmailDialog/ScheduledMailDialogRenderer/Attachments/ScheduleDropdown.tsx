// (C) 2022 GoodData Corporation
import * as React from "react";
import { Dropdown, Button } from "@gooddata/sdk-ui-kit";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX } from "../../constants";

export interface IScheduleDropdownOwnProps {
    title: string;
    applyDisabled?: boolean;
    theme?: ITheme;
    iconComponent?: React.ReactNode;
    onApply?: () => void;
    onCancel?: () => void;
    contentComponent?: React.ReactNode;
}

type IScheduleDropdownProps = IScheduleDropdownOwnProps & WrappedComponentProps;

export const ScheduleDropdownComponent: React.FC<IScheduleDropdownProps> = (props) => {
    const { title, applyDisabled, intl, onApply, onCancel, iconComponent, contentComponent } = props;

    const renderBody = (closeDropdown: () => void) => {
        return (
            <div className="gd-dropdown overlay">
                <div className="gd-schedule-dropdown-body">
                    {renderBodyHeader()}
                    {renderBodyContentWrapper()}
                    {renderBodyFooter(closeDropdown)}
                </div>
            </div>
        );
    };

    const renderBodyHeader = () => {
        return (
            <div className="gd-schedule-dropdown-header">
                <span>{title}</span>
            </div>
        );
    };

    const renderBodyContentWrapper = () => {
        return <div className="gd-schedule-dropdown-content">{contentComponent}</div>;
    };

    const renderBodyFooter = (closeDropdown: () => void) => {
        const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
        const applyText = intl.formatMessage({ id: "gs.list.apply" });
        return (
            <div className="gd-schedule-dropdown-footer">
                <Button
                    className="gd-button-secondary gd-button-small"
                    value={cancelText}
                    onClick={() => {
                        onCancel?.();
                        closeDropdown();
                    }}
                />
                <Button
                    className="gd-button-action gd-button-small"
                    disabled={applyDisabled}
                    value={applyText}
                    onClick={() => {
                        onApply?.();
                        closeDropdown();
                    }}
                />
            </div>
        );
    };

    return (
        <Dropdown
            overlayPositionType="sameAsTarget"
            alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
            overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
            ignoreClicksOnByClass={[
                ".s-format-options-dropdown-ignore",
                ".s-format-options-dropdown-content-ignore",
            ]}
            renderButton={({ toggleDropdown }) => (
                <a
                    className="gd-schedule-dropdown-button"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={toggleDropdown}
                >
                    {iconComponent && <div className="gd-schedule-dropdown-button-icon">{iconComponent}</div>}
                    {title}
                </a>
            )}
            renderBody={({ closeDropdown }) => renderBody(closeDropdown)}
        />
    );
};

export const ScheduleDropdown = injectIntl(withTheme(ScheduleDropdownComponent));
