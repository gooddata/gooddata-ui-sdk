// (C) 2020 GoodData Corporation
import { DateFormat } from "./dateValueParser.js";

export type DateFormatter = (value: Date, format?: DateFormat) => string;
