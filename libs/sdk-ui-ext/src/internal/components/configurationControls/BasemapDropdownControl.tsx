// (C) 2026 GoodData Corporation

import { memo } from "react";

import { type IPushData } from "@gooddata/sdk-ui";

import { DropdownControl, type IDropdownControlProps } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { type IDropdownItem } from "../../interfaces/Dropdown.js";

export interface IBasemapDropdownControlProps extends Omit<
    IDropdownControlProps,
    "items" | "valuePath" | "labelText"
> {
    items: IDropdownItem[];
    /**
     * When false the control renders nothing.
     * This absorbs the feature-flag check so callers don't need a wrapper.
     */
    enabled?: boolean;
}

export const BasemapDropdownControl = memo(function BasemapDropdownControl({
    items,
    enabled = true,
    ...props
}: IBasemapDropdownControlProps) {
    if (!enabled) {
        return null;
    }

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
                    tileset: undefined,
                },
            },
        });
    };

    return (
        <DropdownControl
            {...props}
            valuePath="basemap"
            labelText={messages["basemapTitle"].id}
            value={props.value ?? "default"}
            items={items}
            pushData={pushData}
        />
    );
});
