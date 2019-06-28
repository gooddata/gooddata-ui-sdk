// (C) 2007-2019 GoodData Corporation
import isObject = require("lodash/isObject");
import { SDK } from "@gooddata/gooddata-js";
import isNil = require("lodash/isNil");
import { name as pkgName, version as pkgVersion } from "../../package.json";

export function setTelemetryHeaders(sdk: SDK, componentName: string, props: object) {
    sdk.config.setJsPackage(pkgName, pkgVersion);

    sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP", componentName);
    if (isObject(props)) {
        sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP-PROPS", Object.keys(props).join(","));
    }
}

export function getObjectIdFromUri(uri: string): string {
    const match = /\/obj\/([^$\/\?]*)/.exec(uri);
    return match ? match[1] : null;
}

export function visualizationIsBetaWarning() {
    // tslint:disable-next-line no-console
    console.warn(
        "This chart is not production-ready and may not provide the full functionality. Use it at your own risk.",
    );
}

export function percentFormatter(value: number): string {
    return isNil(value) ? "" : `${parseFloat(value.toFixed(2))}%`;
}

export const unwrap = (wrappedObject: any) => {
    return wrappedObject[Object.keys(wrappedObject)[0]];
};
