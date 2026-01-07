// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { GeoViewportControl, type IGeoViewportControl } from "./GeoViewportControl.js";

export interface IPushpinViewportControl {
    disabled: boolean;
    properties: IGeoViewportControl["properties"];
    pushData: IGeoViewportControl["pushData"];
}

/**
 * Viewport control for pushpin charts.
 * Thin wrapper around GeoViewportControl for backward compatibility.
 *
 * @internal
 */
export function PushpinViewportControl(props: IPushpinViewportControl): ReactElement {
    return <GeoViewportControl {...props} className="s-pushpin-viewport-control" />;
}
