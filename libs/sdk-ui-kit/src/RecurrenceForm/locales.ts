// (C) 2024-2025 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

export const messages: Record<string, MessageDescriptor> = defineMessages({
    starts: { id: "recurrence.starts" },
    repeats: { id: "recurrence.repeats" },
    recurrence_hourly: { id: "recurrence.types.hourly" },
    recurrence_daily: { id: "recurrence.types.daily" },
    recurrence_monthly: { id: "recurrence.types.monthly" },
    recurrence_monthly_last: { id: "recurrence.types.monthly.last" },
    recurrence_monthly_first: { id: "recurrence.types.monthly.first" },
    recurrence_weekly: { id: "recurrence.types.weekly" },
    recurrence_weekly_first: { id: "recurrence.types.weekly.first" },
    recurrence_cron: { id: "recurrence.types.cron" },
    recurrence_inherit: { id: "recurrence.types.inherit" },
    recurrence_inherit_info: { id: "recurrence.types.inherit.info" },

    description_recurrence_hourly: { id: "recurrence.description.hourly" },
    description_recurrence_daily: { id: "recurrence.description.daily" },
    description_recurrence_weekly_first: { id: "recurrence.description.weekly_first" },
    description_recurrence_weekly: { id: "recurrence.description.weekly" },
    description_recurrence_monthly_first: { id: "recurrence.description.monthly_first" },
    description_recurrence_monthly: { id: "recurrence.description.monthly" },
});
