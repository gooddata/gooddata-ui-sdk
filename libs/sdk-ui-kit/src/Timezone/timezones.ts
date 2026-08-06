// (C) 2026 GoodData Corporation

/**
 * Item describing a single timezone from the curated list.
 *
 * @internal
 */
export interface ITimezoneItem {
    /**
     * IANA timezone ID, e.g. "Europe/Prague".
     */
    id: string;

    /**
     * Human readable name without the offset, e.g. "Prague" or "Pacific Time (US & Canada)".
     */
    name: string;

    /**
     * GMT offset label, e.g. "GMT+01:00".
     */
    offsetLabel: string;

    /**
     * Offset from UTC in minutes as observed in January (northern hemisphere winter).
     */
    januaryOffset: number;

    /**
     * Offset from UTC in minutes as observed in June (northern hemisphere summer).
     */
    juneOffset: number;
}

const timezonesRaw: [
    id: string,
    name: string,
    offsetLabel: string,
    januaryOffset: number,
    juneOffset: number,
][] = [
    ["Pacific/Midway", "International Date Line West", "GMT-11:00", -660, -660],
    ["Pacific/Pago_Pago", "Samoa", "GMT-11:00", -660, -660],
    ["Pacific/Honolulu", "Hawaii", "GMT-10:00", -600, -600],
    ["America/Juneau", "Alaska", "GMT-09:00", -540, -480],
    ["America/Los_Angeles", "Pacific Time (US & Canada)", "GMT-08:00", -480, -420],
    ["America/Tijuana", "Tijuana", "GMT-08:00", -480, -420],
    ["America/Phoenix", "Arizona", "GMT-07:00", -420, -420],
    ["America/Chihuahua", "Chihuahua", "GMT-07:00", -420, -360],
    ["America/Mazatlan", "Mazatlan", "GMT-07:00", -420, -360],
    ["America/Denver", "Mountain Time (US & Canada)", "GMT-07:00", -420, -360],
    ["America/Guatemala", "Central America", "GMT-06:00", -360, -360],
    ["America/Chicago", "Central Time (US & Canada)", "GMT-06:00", -360, -300],
    ["America/Winnipeg", "Central - ON (west); Manitoba", "GMT-06:00", -360, -300],
    ["America/Mexico_City", "Mexico City", "GMT-06:00", -360, -300],
    ["America/Monterrey", "Monterrey", "GMT-06:00", -360, -300],
    ["America/Regina", "Saskatchewan", "GMT-06:00", -360, -360],
    ["America/Bogota", "Bogota", "GMT-05:00", -300, -300],
    ["America/New_York", "Eastern Time (US & Canada)", "GMT-05:00", -300, -240],
    ["America/Indiana/Indianapolis", "Indiana (East)", "GMT-05:00", -300, -240],
    ["America/Lima", "Lima", "GMT-05:00", -300, -300],
    ["America/Caracas", "Caracas", "GMT-04:30", -270, -270],
    ["America/Halifax", "Atlantic Time (Canada)", "GMT-04:00", -240, -180],
    ["America/Guyana", "Georgetown", "GMT-04:00", -240, -240],
    ["America/La_Paz", "La Paz", "GMT-04:00", -240, -240],
    ["America/Santiago", "Santiago", "GMT-04:00", -180, -240],
    ["America/St_Johns", "Newfoundland", "GMT-03:30", -210, -150],
    ["America/Sao_Paulo", "Brasilia", "GMT-03:00", -120, -180],
    ["America/Argentina/Buenos_Aires", "Buenos Aires", "GMT-03:00", -180, -180],
    ["America/Godthab", "Greenland", "GMT-03:00", -180, -120],
    ["Atlantic/South_Georgia", "Mid-Atlantic", "GMT-02:00", -120, -120],
    ["Atlantic/Azores", "Azores", "GMT-01:00", -60, 0],
    ["Atlantic/Cape_Verde", "Cape Verde Is.", "GMT-01:00", -60, -60],
    ["Africa/Casablanca", "Casablanca", "GMT+00:00", 0, 0],
    ["Europe/Dublin", "Dublin", "GMT+00:00", 0, 60],
    ["Europe/Lisbon", "Lisbon", "GMT+00:00", 0, 60],
    ["Europe/London", "London", "GMT+00:00", 0, 60],
    ["Africa/Monrovia", "Monrovia", "GMT+00:00", 0, 0],
    ["Etc/UTC", "UTC", "GMT+00:00", 0, 0],
    ["Europe/Amsterdam", "Amsterdam", "GMT+01:00", 60, 120],
    ["Europe/Belgrade", "Belgrade", "GMT+01:00", 60, 120],
    ["Europe/Berlin", "Berlin", "GMT+01:00", 60, 120],
    ["Europe/Bratislava", "Bratislava", "GMT+01:00", 60, 120],
    ["Europe/Brussels", "Brussels", "GMT+01:00", 60, 120],
    ["Europe/Budapest", "Budapest", "GMT+01:00", 60, 120],
    ["Europe/Copenhagen", "Copenhagen", "GMT+01:00", 60, 120],
    ["Europe/Ljubljana", "Ljubljana", "GMT+01:00", 60, 120],
    ["Europe/Madrid", "Madrid", "GMT+01:00", 60, 120],
    ["Europe/Paris", "Paris", "GMT+01:00", 60, 120],
    ["Europe/Prague", "Prague", "GMT+01:00", 60, 120],
    ["Europe/Rome", "Rome", "GMT+01:00", 60, 120],
    ["Europe/Sarajevo", "Sarajevo", "GMT+01:00", 60, 120],
    ["Europe/Skopje", "Skopje", "GMT+01:00", 60, 120],
    ["Europe/Stockholm", "Stockholm", "GMT+01:00", 60, 120],
    ["Europe/Vienna", "Vienna", "GMT+01:00", 60, 120],
    ["Europe/Warsaw", "Warsaw", "GMT+01:00", 60, 120],
    ["Africa/Algiers", "West Central Africa", "GMT+01:00", 60, 60],
    ["Europe/Zagreb", "Zagreb", "GMT+01:00", 60, 120],
    ["Europe/Athens", "Athens", "GMT+02:00", 120, 180],
    ["Europe/Bucharest", "Bucharest", "GMT+02:00", 120, 180],
    ["Africa/Cairo", "Cairo", "GMT+02:00", 120, 180],
    ["Africa/Harare", "Harare", "GMT+02:00", 120, 120],
    ["Europe/Helsinki", "Helsinki", "GMT+02:00", 120, 180],
    ["Europe/Istanbul", "Istanbul", "GMT+02:00", 120, 180],
    ["Asia/Jerusalem", "Jerusalem", "GMT+02:00", 120, 180],
    ["Europe/Kiev", "Kyiv", "GMT+02:00", 120, 180],
    ["Europe/Minsk", "Minsk", "GMT+02:00", 120, 180],
    ["Africa/Johannesburg", "Pretoria", "GMT+02:00", 120, 120],
    ["Europe/Riga", "Riga", "GMT+02:00", 120, 180],
    ["Europe/Sofia", "Sofia", "GMT+02:00", 120, 180],
    ["Europe/Tallinn", "Tallinn", "GMT+02:00", 120, 180],
    ["Europe/Vilnius", "Vilnius", "GMT+02:00", 120, 180],
    ["Asia/Baghdad", "Baghdad", "GMT+03:00", 180, 180],
    ["Asia/Kuwait", "Kuwait", "GMT+03:00", 180, 180],
    ["Europe/Moscow", "Moscow", "GMT+03:00", 180, 240],
    ["Africa/Nairobi", "Nairobi", "GMT+03:00", 180, 180],
    ["Asia/Riyadh", "Riyadh", "GMT+03:00", 180, 180],
    ["Asia/Tehran", "Tehran", "GMT+03:30", 210, 270],
    ["Asia/Baku", "Baku", "GMT+04:00", 240, 300],
    ["Asia/Muscat", "Muscat", "GMT+04:00", 240, 240],
    ["Asia/Tbilisi", "Tbilisi", "GMT+04:00", 240, 240],
    ["Asia/Yerevan", "Yerevan", "GMT+04:00", 240, 300],
    ["Asia/Kabul", "Kabul", "GMT+04:30", 270, 270],
    ["Asia/Yekaterinburg", "Ekaterinburg", "GMT+05:00", 300, 360],
    ["Asia/Karachi", "Karachi", "GMT+05:00", 300, 300],
    ["Asia/Tashkent", "Tashkent", "GMT+05:00", 300, 300],
    ["Asia/Kolkata", "Kolkata", "GMT+05:30", 330, 330],
    ["Asia/Colombo", "Sri Jayawardenepura", "GMT+05:30", 330, 330],
    ["Asia/Kathmandu", "Kathmandu", "GMT+05:45", 345, 345],
    ["Asia/Almaty", "Almaty", "GMT+06:00", 360, 360],
    ["Asia/Dhaka", "Dhaka", "GMT+06:00", 360, 360],
    ["Asia/Novosibirsk", "Novosibirsk", "GMT+06:00", 360, 420],
    ["Asia/Rangoon", "Rangoon", "GMT+06:30", 390, 390],
    ["Asia/Bangkok", "Bangkok", "GMT+07:00", 420, 420],
    ["Asia/Jakarta", "Jakarta", "GMT+07:00", 420, 420],
    ["Asia/Krasnoyarsk", "Krasnoyarsk", "GMT+07:00", 420, 480],
    ["Asia/Shanghai", "Beijing", "GMT+08:00", 480, 480],
    ["Asia/Chongqing", "Chongqing", "GMT+08:00", 480, 480],
    ["Asia/Hong_Kong", "Hong Kong", "GMT+08:00", 480, 480],
    ["Asia/Irkutsk", "Irkutsk", "GMT+08:00", 480, 540],
    ["Asia/Kuala_Lumpur", "Kuala Lumpur", "GMT+08:00", 480, 480],
    ["Australia/Perth", "Perth", "GMT+08:00", 480, 480],
    ["Asia/Singapore", "Singapore", "GMT+08:00", 480, 480],
    ["Asia/Taipei", "Taipei", "GMT+08:00", 480, 480],
    ["Asia/Ulaanbaatar", "Ulaanbaatar", "GMT+08:00", 480, 480],
    ["Asia/Urumqi", "Urumqi", "GMT+08:00", 480, 480],
    ["Asia/Seoul", "Seoul", "GMT+09:00", 540, 540],
    ["Asia/Tokyo", "Tokyo", "GMT+09:00", 540, 540],
    ["Asia/Yakutsk", "Yakutsk", "GMT+09:00", 540, 600],
    ["Australia/Adelaide", "Adelaide", "GMT+09:30", 630, 570],
    ["Australia/Darwin", "Darwin", "GMT+09:30", 570, 570],
    ["Australia/Brisbane", "Brisbane", "GMT+10:00", 600, 600],
    ["Pacific/Guam", "Guam", "GMT+10:00", 600, 600],
    ["Australia/Hobart", "Hobart", "GMT+10:00", 660, 600],
    ["Australia/Melbourne", "Melbourne", "GMT+10:00", 660, 600],
    ["Pacific/Port_Moresby", "Port Moresby", "GMT+10:00", 600, 600],
    ["Australia/Sydney", "Sydney", "GMT+10:00", 660, 600],
    ["Asia/Vladivostok", "Vladivostok", "GMT+10:00", 600, 660],
    ["Asia/Kamchatka", "Kamchatka", "GMT+11:00", 660, 720],
    ["Asia/Magadan", "Magadan", "GMT+11:00", 660, 720],
    ["Pacific/Noumea", "New Caledonia", "GMT+11:00", 660, 660],
    ["Asia/Sakhalin", "Sakhalin Island", "GMT+11:00", 660, 660],
    ["Pacific/Auckland", "Auckland", "GMT+12:00", 780, 720],
    ["Pacific/Fiji", "Fiji", "GMT+12:00", 780, 720],
    ["Pacific/Majuro", "Marshall Is.", "GMT+12:00", 720, 720],
    ["Pacific/Tongatapu", "Nuku'alofa", "GMT+13:00", 780, 780],
];

const timezones: ITimezoneItem[] = timezonesRaw.map(([id, name, offsetLabel, januaryOffset, juneOffset]) => ({
    id,
    name,
    offsetLabel,
    januaryOffset,
    juneOffset,
}));

const TIMEZONE_DEFAULT = timezones.find((tz) => tz.id === "Etc/UTC")!;

/**
 * Returns the full display label of a timezone, combining the offset and the name,
 * e.g. "GMT+01:00 Prague". Use only where the merged label is actually displayed;
 * consumers that need the name or the offset alone should read the fields directly.
 *
 * @internal
 */
export function getTimezoneTitle(item: Pick<ITimezoneItem, "name" | "offsetLabel">): string {
    return item.offsetLabel ? `${item.offsetLabel} ${item.name}` : item.name;
}

/**
 * Returns the curated list of timezones.
 *
 * @internal
 */
export function getTimezones(): ITimezoneItem[] {
    return timezones;
}

/**
 * Returns the timezone from the curated list matching the provided IANA timezone ID,
 * or undefined when the ID is not in the curated list.
 *
 * @internal
 */
export function getTimezoneById(id: string | undefined): ITimezoneItem | undefined {
    return timezones.find((tz) => tz.id === id);
}

/**
 * Returns the curated timezone that matches the offsets of the browser/runtime timezone.
 * Falls back to UTC when no curated timezone matches.
 *
 * @internal
 */
export function getUserTimezone(): ITimezoneItem {
    // prefer the exact runtime IANA id so zones sharing offsets (e.g. Berlin vs Amsterdam)
    // resolve to the viewer's actual zone; fall back to offset matching for runtime ids
    // that are not part of the curated list
    const runtimeTimezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const exactMatch = getTimezoneById(runtimeTimezoneId);
    if (exactMatch) {
        return exactMatch;
    }

    // sample the offsets on a fixed date in winter and in summer so that both DST variants are covered
    const januaryOffset = -new Date(2011, 0, 1, 0, 0, 0, 0).getTimezoneOffset();
    const juneOffset = -new Date(2011, 5, 1, 0, 0, 0, 0).getTimezoneOffset();

    return (
        timezones.find((tz) => tz.januaryOffset === januaryOffset && tz.juneOffset === juneOffset) ??
        TIMEZONE_DEFAULT
    );
}

/**
 * Returns the display label used by the timezone picker: the friendly name with the GMT offset
 * as a suffix in brackets, e.g. "Prague (GMT+01:00)". The name falls back to the raw IANA ID
 * for zones outside the curated list, and the offset suffix is dropped when not known.
 *
 * The friendly name (not the IANA ID) is shown so the picker reads the same as the Home UI
 * timezone settings — the id-to-name mapping is not visible to users anywhere.
 *
 * @internal
 */
export function getTimezoneDisplayLabel(id: string): string {
    const { name } = getTimezoneLabels(id);
    return name;
}

/**
 * Tests whether the timezone matches the search string. Matches on the picker display label
 * ("name (offset)"), the friendly title (offset + name) and the IANA ID, with underscores
 * treated as spaces so that e.g. "Los Angeles" finds "America/Los_Angeles".
 *
 * @internal
 */
export function timezoneMatchesSearch(timezone: ITimezoneItem, search: string): boolean {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
        return true;
    }

    return (
        getTimezoneTitle(timezone).toLowerCase().includes(normalizedSearch) ||
        getTimezoneDisplayLabel(timezone.id).toLowerCase().includes(normalizedSearch) ||
        timezone.id.toLowerCase().replace(/_/g, " ").includes(normalizedSearch.replace(/_/g, " "))
    );
}

function computeOffsetLabel(id: string): string {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: id,
            timeZoneName: "longOffset",
        }).formatToParts(new Date());
        const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value;
        if (!offsetPart) {
            return "";
        }
        // plain "GMT" is reported for the zero offset; normalize to the curated label format
        return offsetPart === "GMT" ? "GMT+00:00" : offsetPart;
    } catch {
        return "";
    }
}

/**
 * Returns display labels for the provided IANA timezone ID.
 *
 * @remarks
 * The backend accepts any ICU-known timezone, so the ID may not be present in the curated list.
 * In that case the raw ID is used as the name and the offset label is computed via Intl
 * (empty when the runtime does not know the timezone either).
 *
 * @internal
 */
export function getTimezoneLabels(id: string): Pick<ITimezoneItem, "name" | "offsetLabel"> {
    const known = getTimezoneById(id);
    if (known) {
        return { name: known.name, offsetLabel: known.offsetLabel };
    }

    return {
        name: id,
        offsetLabel: computeOffsetLabel(id),
    };
}

/**
 * Returns the current time in the provided timezone.
 *
 * @internal
 */
export function getCurrentTimeByTimezoneId(id: string) {
    const dateTime = new Date().toLocaleString("en-US", { timeZone: id });
    // create new Date object
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return hours && minutes ? `${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}` : "";
}
