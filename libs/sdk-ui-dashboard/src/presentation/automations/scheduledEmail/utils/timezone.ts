// (C) 2019-2026 GoodData Corporation

import {
    type ITimezoneItem,
    getTimezoneById,
    getTimezoneTitle,
    getUserTimezone as getUserTimezoneItem,
} from "@gooddata/sdk-ui-kit";

/**
 * Scheduled-email flavor of a timezone entry, adapting the shared curated list from sdk-ui-kit.
 */
export interface ITimezone {
    identifier: string;
    januaryOffset: number;
    juneOffset: number;
    title: string;
}

function toTimezone(item: ITimezoneItem): ITimezone {
    return {
        identifier: item.id,
        title: getTimezoneTitle(item),
        januaryOffset: item.januaryOffset,
        juneOffset: item.juneOffset,
    };
}

export const TIMEZONE_DEFAULT = toTimezone(getTimezoneById("Etc/UTC")!);

export function getUserTimezone(): ITimezone {
    return toTimezone(getUserTimezoneItem());
}

export function getTimezoneByIdentifier(identifier: string | undefined): ITimezone | undefined {
    const item = identifier ? getTimezoneById(identifier) : undefined;
    return item ? toTimezone(item) : undefined;
}
