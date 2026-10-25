// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import { DROPDOWN_ALIGN_POINTS } from "../../utils/dropdown.js";

import { DataSamplerDropdownBody } from "./DataSamplerDropdownBody.js";

export function DataSamplerDropdown({
    isDisabled,
    dataSamplerPercentage,
    setDataSamplePercentageValue,
}: {
    isDisabled: boolean;
    dataSamplerPercentage: number;
    setDataSamplePercentageValue: (percentage: number) => void;
}) {
    const intl = useIntl();

    return (
        <Dropdown
            className="adi-data-sampler-dropdown"
            renderButton={({ toggleDropdown }) => {
                return (
                    <DropdownButton
                        className={cx("adi-data-sampler-dropdown-button", [
                            { "adi-data-sampler-dropdown-button-active": !isDisabled },
                        ])}
                        value={
                            isDisabled
                                ? intl.formatMessage({ id: "dataSampler.dropdown.button.label.disabled" })
                                : `${intl.formatMessage({
                                      id: "dataSampler.dropdown.button.label",
                                  })} ${intl.formatNumber(dataSamplerPercentage, {
                                      unit: "percent",
                                      style: "unit",
                                      // This is necessary to prevent rounding
                                      maximumFractionDigits: 10,
                                  })}`
                        }
                        onClick={toggleDropdown}
                        disabled={isDisabled}
                    />
                );
            }}
            renderBody={({ closeDropdown }) => {
                return (
                    <DataSamplerDropdownBody
                        onClose={closeDropdown}
                        dataSamplePercentageValue={dataSamplerPercentage}
                        setDataSamplePercentageValue={setDataSamplePercentageValue}
                    />
                );
            }}
            closeOnOutsideClick
            closeOnMouseDrag
            closeOnParentScroll
            alignPoints={DROPDOWN_ALIGN_POINTS}
        />
    );
}
