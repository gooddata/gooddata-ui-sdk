// (C) 2007-2019 GoodData Corporation
import isNil = require("lodash/isNil");

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
