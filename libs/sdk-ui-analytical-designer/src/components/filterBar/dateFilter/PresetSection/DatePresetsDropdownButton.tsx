// (C) 2022-2026 GoodData Corporation

import { type Ref } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";

import { isAbsoluteDateFilterForm, isRelativeDateFilterForm } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { DateFilterHelpers, type DateFilterOption } from "@gooddata/sdk-ui-filters";
import { DropdownButton, type IDropdownButtonRenderProps } from "@gooddata/sdk-ui-kit";

import { DropdownButtonWrapper } from "../../../DropdownButtonWrapper.js";

interface IPresetTitleProps {
    preset: DateFilterOption;
    dateFormat: string;
}

function LocalizedPresetTitle({ preset, dateFormat }: IPresetTitleProps) {
    const sdkIntl = useIntl();
    return <>{DateFilterHelpers.getDateFilterTitleUsingTranslator(preset, sdkIntl, "full", dateFormat)}</>;
}

function PresetTitle(props: IPresetTitleProps) {
    const adIntl = useIntl();
    return (
        <IntlWrapper locale={adIntl.locale}>
            <LocalizedPresetTitle {...props} />
        </IntlWrapper>
    );
}

function ButtonTitle({ preset, dateFormat }: IPresetTitleProps) {
    const intl = useIntl();
    if (isAbsoluteDateFilterForm(preset)) {
        return <>{intl.formatMessage({ id: "static_period" })}</>;
    }
    if (isRelativeDateFilterForm(preset)) {
        return <>{intl.formatMessage({ id: "floating_period" })}</>;
    }
    return <PresetTitle preset={preset} dateFormat={dateFormat} />;
}

export interface IDatePresetsDropdownButtonProps extends IDropdownButtonRenderProps {
    selectedPreset: DateFilterOption;
    buttonWrapperRef: Ref<HTMLDivElement>;
    dateFormat: string;
}

export function DatePresetsDropdownButton({
    isOpen,
    toggleDropdown,
    selectedPreset,
    buttonWrapperRef,
    dateFormat,
}: IDatePresetsDropdownButtonProps) {
    const buttonClassName = classNames("s-date-preset-button", {
        "s-expanded": isOpen,
        "s-collapsed": !isOpen,
    });
    return (
        <DropdownButtonWrapper setRef={buttonWrapperRef}>
            <DropdownButton
                id="preset-dropdown"
                className={buttonClassName}
                value={<ButtonTitle preset={selectedPreset} dateFormat={dateFormat} />}
                onClick={toggleDropdown}
            />
        </DropdownButtonWrapper>
    );
}
