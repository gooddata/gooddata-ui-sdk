// (C) 2024 GoodData Corporation

import { MessageDescriptor, defineMessages } from "react-intl";

export const messages: Record<string, MessageDescriptor> = defineMessages({
    starts: { id: "recurrence.starts" },
    repeats: { id: "recurrence.repeats" },
    recurrence_hourly: { id: "recurrence.types.hourly" },
    recurrence_daily: { id: "recurrence.types.daily" },
    recurrence_monthly: { id: "recurrence.types.monthly" },
    recurrence_monthly_last: { id: "recurrence.types.monthly.last" },
    recurrence_weekly: { id: "recurrence.types.weekly" },
    recurrence_cron: { id: "recurrence.types.cron" },
});
