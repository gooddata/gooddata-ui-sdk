// (C) 2022 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Dropdown, Button } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX } from "../../constants.js";

const ALIGN_POINTS = [
    { align: "bc tc", offset: { x: 0, y: 0 } },
    { align: "tc bc", offset: { x: 0, y: 0 } },
];

export interface IScheduleDropdownProps {
    title: string;
    applyDisabled?: boolean;
    iconComponent?: React.ReactNode;
    onApply?: () => void;
    onCancel?: () => void;
    contentComponent?: React.ReactNode;
    buttonClassName?: string;
    bodyClassName?: string;
    buttonDisabled?: boolean;
}

export const ScheduleDropdown: React.FC<IScheduleDropdownProps> = (props) => {
    const {
        title,
        applyDisabled,
        onApply,
        onCancel,
        iconComponent,
        contentComponent,
        buttonClassName,
        bodyClassName,
        buttonDisabled,
    } = props;

    const intl = useIntl();

    const renderBody = (closeDropdown: () => void) => {
        return (
            <div className="gd-dropdown overlay">
                <div className={cx("gd-schedule-dropdown-body", bodyClassName)}>
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
            ignoreClicksOnByClass={[".schedule-dropdown-ignore-click"]}
            renderButton={({ toggleDropdown }) => (
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <a
                        className={cx("gd-schedule-dropdown-button", buttonClassName, {
                            "gd-schedule-dropdown-button-disabled": !!buttonDisabled,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            !buttonDisabled && toggleDropdown();
                        }}
                    >
                        {iconComponent ? (
                            <div className="gd-schedule-dropdown-button-icon">{iconComponent}</div>
                        ) : null}
                        {title}
                    </a>
                    {buttonDisabled ? (
                        <Bubble className="bubble-primary" alignPoints={ALIGN_POINTS}>
                            <FormattedMessage
                                id={"dialogs.schedule.email.attachment.select.disabled.message"}
                            />
                        </Bubble>
                    ) : null}
                </BubbleHoverTrigger>
            )}
            renderBody={({ closeDropdown }) => renderBody(closeDropdown)}
        />
    );
};
