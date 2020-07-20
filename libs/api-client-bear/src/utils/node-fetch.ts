// (C) 2007-2020 GoodData Corporation
import nodeFetch from "node-fetch";
import fetchCookie from "fetch-cookie";

export const fetch = fetchCookie(nodeFetch as any);
