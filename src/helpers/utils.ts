// (C) 2007-2018 GoodData Corporation
import { isObject } from 'lodash';
import { SDK } from '@gooddata/gooddata-js';
import { name as pkgName, version as pkgVersion } from '../../package.json';

export function setTelemetryHeaders(sdk: SDK, componentName: string, props: object) {
    sdk.config.setJsPackage(pkgName, pkgVersion);

    sdk.config.setRequestHeader('X-GDC-JS-SDK-COMP', componentName);
    if (isObject(props)) {
        sdk.config.setRequestHeader('X-GDC-JS-SDK-COMP-PROPS', Object.keys(props).join(','));
    }
}

export function getObjectIdFromUri(uri: string): string {
    const match = /\/obj\/([^$\/\?]*)/.exec(uri);
    return match ? match[1] : null;
}

export function visualizationIsBetaWarning() {
    // tslint:disable-next-line no-console
    console.warn(
        'This chart is not production-ready and may not provide the full functionality. Use it at your own risk.'
    );
}

export const unwrap = (wrappedObject: any) => {
    return wrappedObject[Object.keys(wrappedObject)[0]];
};
