// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { DropdownControl, type IDropdownControlProps } from "./DropdownControl.js";
import { basemapDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

type IBasemapDropdownControlProps = Omit<IDropdownControlProps, "items">;

export const BasemapDropdownControl = memo(function BasemapDropdownControl(
    props: IBasemapDropdownControlProps,
) {
    const intl = useIntl();

    return <DropdownControl {...props} items={getTranslatedDropdownItems(basemapDropdownItems, intl)} />;
});
