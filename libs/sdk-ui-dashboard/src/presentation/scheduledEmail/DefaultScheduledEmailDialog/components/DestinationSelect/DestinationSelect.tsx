// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Dropdown,
    DropdownButton,
    DropdownList,
    Hyperlink,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX } from "../../constants.js";
import { IWebhookDefinitionObject } from "@gooddata/sdk-model";

const DROPDOWN_WIDTH = 199;

interface IDestinationItem {
    id: string;
    title: string;
}

interface IDestinationSelectProps {
    webhooks: IWebhookDefinitionObject[];
    selectedItemId: string | undefined;
    onChange: (selectedItemId: string) => void;
}

export const DestinationSelect: React.FC<IDestinationSelectProps> = ({
    webhooks,
    selectedItemId,
    onChange,
}) => {
    const intl = useIntl();
    const items = useMemo(() => {
        return (
            webhooks?.map(
                (wh): IDestinationItem => ({
                    id: wh.id,
                    title: wh.destination?.name ?? wh.id,
                }),
            ) ?? []
        );
    }, [webhooks]);

    const selectedItem = useMemo(() => {
        return items.find((item) => item.id === selectedItemId);
    }, [items, selectedItemId]);

    return (
        <div className="gd-input-component gd-destination-field s-gd-schedule-email-dialog-destination">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.destination" />
            </label>
            {items.length === 0 ? (
                <div className="gd-schedule-email-dialog-destination-empty">
                    <span>
                        <span className="gd-icon-warning" />
                        <FormattedMessage id="dialogs.schedule.email.destination.missing" />
                    </span>
                    <Hyperlink
                        text={intl.formatMessage({ id: "dialogs.schedule.email.destination.help" })}
                        href="/settings"
                    />
                </div>
            ) : (
                <Dropdown
                    alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
                    className="gd-schedule-email-dialog-destination s-gd-schedule-email-dialog-destination"
                    renderButton={({ toggleDropdown }) => (
                        <DropdownButton
                            value={selectedItem?.title}
                            onClick={toggleDropdown}
                            className="gd-schedule-email-dialog-destination-button"
                        />
                    )}
                    renderBody={({ closeDropdown, isMobile }) => (
                        <DropdownList
                            width={DROPDOWN_WIDTH}
                            items={items}
                            isMobile={isMobile}
                            renderItem={({ item }) => (
                                <SingleSelectListItem
                                    title={item.title}
                                    onClick={() => {
                                        onChange(item.id);
                                        closeDropdown();
                                    }}
                                    isSelected={selectedItem?.id === item.id}
                                />
                            )}
                        />
                    )}
                    overlayPositionType="sameAsTarget"
                    overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                />
            )}
        </div>
    );
};
