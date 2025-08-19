// (C) 2020-2025 GoodData Corporation

import * as fs from "fs";
import util from "util";

export const readFile = util.promisify(fs.readFile);
