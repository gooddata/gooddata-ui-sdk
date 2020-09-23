// (C) 2020 GoodData Corporation

export function mapChineseLocaleForMoment(intlLocale: string): string {
    if (intlLocale === "zh-Hans") {
        return "zh-cn";
    }
    return intlLocale;
}
