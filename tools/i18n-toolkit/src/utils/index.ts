// (C) 2020-2022 GoodData Corporation

import util from "util";
import * as fs from "fs";

export const readFile = util.promisify(fs.readFile);
