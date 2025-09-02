// (C) 2007-2025 GoodData Corporation

declare global {
    interface Window {
        _gd_uuid: number;
    }
}

// borrowed from Ember
if (typeof window !== "undefined") {
    window._gd_uuid = 0;
}

function getGuid() {
    if (typeof window === "undefined") {
        return 0;
    }
    window._gd_uuid += 1;
    return window._gd_uuid;
}

/**
 * Generate GUID for the object and set it as its '__infID' prop.
 *
 * @param obj - object to set guid to
 * @returns newly generated guid or already existing one on the object, '(Object)' for Object, '(Array)' for Array.
 *
 * @internal
 */
export function guidFor(obj: any): string {
    const GUID_KEY = "__infID";

    const GUID_DESC: {
        writable: boolean;
        configurable: boolean;
        enumerable: boolean;
        value: string;
    } = {
        writable: false,
        configurable: false,
        enumerable: false,
        value: null,
    };

    if (obj[GUID_KEY]) return obj[GUID_KEY];
    if (obj === Object) return "(Object)";
    if (obj === Array) return "(Array)";
    const stamp = `gd-guid-${getGuid()}`;

    if (obj[GUID_KEY] === null) {
        obj[GUID_KEY] = stamp;
    } else {
        GUID_DESC.value = stamp;
        Object.defineProperty(obj, GUID_KEY, GUID_DESC);
    }

    return stamp;
}
