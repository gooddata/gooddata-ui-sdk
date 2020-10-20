// (C) 2020 GoodData Corporation
import { DateFormat } from "./dateValueParser";

export type DateFormatter = (value: Date, format?: DateFormat) => string;
