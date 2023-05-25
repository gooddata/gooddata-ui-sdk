// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { DropdownSectionHeader } from "./DropdownSectionHeader.js";
import { isDrillToCustomUrlConfig, UrlDrillTarget } from "../../types.js";

type ToggleModalCallback = () => void;
type CloseDropdownCallback = (e: React.MouseEvent) => void;

interface CustomUrlSectionProps {
    toggleModal: ToggleModalCallback;
    closeDropdown: CloseDropdownCallback;
    urlDrillTarget?: UrlDrillTarget;
}

const UrlDropdownOption = ({
    urlValue,
    closeDropdown,
}: {
    urlValue: string;
    closeDropdown: CloseDropdownCallback;
}) => (
    <div
        onClick={closeDropdown}
        className="gd-list-item gd-menu-item gd-drill-to-custom-url-option s-drill-to-custom-url-option gd-icon-hyperlink-disabled is-selected"
    >
        <span>{urlValue.length > 50 ? `${urlValue.substring(0, 50)}...` : urlValue}</span>
    </div>
);

const EditButton = ({ urlValue, toggleModal }: { urlValue?: string; toggleModal: ToggleModalCallback }) => {
    const intl = useIntl();
    const buttonTitle = urlValue
        ? intl.formatMessage({
              id: "configurationPanel.drillIntoUrl.customUrlEditButtonLabel",
          })
        : intl.formatMessage({
              id: "configurationPanel.drillIntoUrl.customUrlAddButtonLabel",
          });
    const buttonIconLeft = urlValue ? undefined : "gd-icon-add";
    return (
        <Button
            className="gd-button gd-button-secondary gd-button-small s-drill-to-custom-url-button"
            iconLeft={buttonIconLeft}
            onClick={toggleModal}
            value={buttonTitle}
        />
    );
};

export const CustomUrlSection: React.FunctionComponent<CustomUrlSectionProps> = (props) => {
    const { urlDrillTarget, closeDropdown } = props;

    const urlValue = isDrillToCustomUrlConfig(urlDrillTarget) ? urlDrillTarget.customUrl : undefined;

    return (
        <>
            <DropdownSectionHeader>
                <FormattedMessage id="configurationPanel.drillIntoUrl.customUrlSectionTitle" />
            </DropdownSectionHeader>
            {!!urlValue && <UrlDropdownOption urlValue={urlValue} closeDropdown={closeDropdown} />}
            <div className="gd-drill-to-custom-url-button-wrapper">
                <EditButton {...props} urlValue={urlValue} />
            </div>
        </>
    );
};
