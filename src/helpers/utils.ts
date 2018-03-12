import { isObject } from 'lodash';
import { ISdk } from 'gooddata';
import { name as pkgName, version as pkgVersion } from '../../package.json';

export function setTelemetryHeaders(sdk: ISdk, componentName: string, props: object) {
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
