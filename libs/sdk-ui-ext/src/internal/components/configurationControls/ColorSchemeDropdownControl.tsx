// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";

import { DropdownControl, type IDropdownControlProps } from "./DropdownControl.js";
import { colorSchemeDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

type IColorSchemeDropdownControlProps = Omit<IDropdownControlProps, "items">;

export const ColorSchemeDropdownControl = memo(function ColorSchemeDropdownControl(
    props: IColorSchemeDropdownControlProps,
) {
    const intl = useIntl();
    const pushData = (data: IPushData) => {
        if (data.properties?.controls?.["colorScheme"] !== "default") {
            props.pushData?.(data);
            return;
        }

        props.pushData?.({
            ...data,
            properties: {
                ...data.properties,
                controls: {
                    ...data.properties?.controls,
                    colorScheme: undefined,
                },
            },
        });
    };

    return (
        <DropdownControl
            {...props}
            value={props.value ?? "default"}
            items={getTranslatedDropdownItems(colorSchemeDropdownItems, intl)}
            pushData={pushData}
        />
    );
});
