// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";

import { DropdownControl, type IDropdownControlProps } from "./DropdownControl.js";
import { getBasemapDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

interface IBasemapDropdownControlProps extends Omit<IDropdownControlProps, "items"> {
    showSatelliteBasemapOption: boolean;
}

export const BasemapDropdownControl = memo(function BasemapDropdownControl({
    showSatelliteBasemapOption,
    ...props
}: IBasemapDropdownControlProps) {
    const intl = useIntl();
    const pushData = (data: IPushData) => {
        if (data.properties?.controls?.["basemap"] !== "default") {
            props.pushData?.(data);
            return;
        }

        props.pushData?.({
            ...data,
            properties: {
                ...data.properties,
                controls: {
                    ...data.properties?.controls,
                    basemap: undefined,
                    colorScheme: undefined,
                    tileset: undefined,
                },
            },
        });
    };

    return (
        <DropdownControl
            {...props}
            value={props.value ?? "default"}
            items={getTranslatedDropdownItems(
                getBasemapDropdownItems(showSatelliteBasemapOption, props.value ?? "default"),
                intl,
            )}
            pushData={pushData}
        />
    );
});
