// (C) 2024-2025 GoodData Corporation
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";

export function translateGranularity(tran: IntlShape, granularity?: DateAttributeGranularity): string {
    switch (granularity) {
        case "GDC.time.year":
            return tran.formatMessage({ id: "granularity.year" });
        case "GDC.time.week_us":
        case "GDC.time.week":
            return tran.formatMessage({ id: "granularity.week" });
        case "GDC.time.quarter":
            return tran.formatMessage({ id: "granularity.quarter" });
        case "GDC.time.month":
            return tran.formatMessage({ id: "granularity.month" });
        case "GDC.time.date":
            return tran.formatMessage({ id: "granularity.date" });
        case "GDC.time.hour":
            return tran.formatMessage({ id: "granularity.hour" });
        case "GDC.time.minute":
            return tran.formatMessage({ id: "granularity.minute" });
        default:
            return "-";
    }
}
