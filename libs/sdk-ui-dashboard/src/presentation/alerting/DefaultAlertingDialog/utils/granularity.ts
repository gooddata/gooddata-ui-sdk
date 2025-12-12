// (C) 2024-2025 GoodData Corporation
import { type IntlShape } from "react-intl";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

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
