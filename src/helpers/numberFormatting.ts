// (C) 2019 GoodData Corporation
import escape = require("lodash/escape");
import { numberFormat } from "@gooddata/numberjs";

export const formatNumberEscaped: typeof numberFormat = (...args): string => escape(numberFormat(...args));
