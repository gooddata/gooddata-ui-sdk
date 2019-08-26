// (C) 2007-2019 GoodData Corporation
import { Role } from "testcafe";
import { config } from "./config";
import { loginUsingLoginForm } from "./helpers";

// Last time I checked, this didn't work. 2018-11-05
export const currentUser = Role(`${config.url}/login`, loginUsingLoginForm);
