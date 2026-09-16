// (C) 2026 GoodData Corporation

import { AxiosHeaders, type AxiosResponse } from "axios";

/**
 * Wraps a response body the way axios hands it to the generated endpoint functions.
 */
export function axiosResponse<T>(data: T): AxiosResponse<T> {
    return { data, status: 200, statusText: "OK", headers: {}, config: { headers: new AxiosHeaders() } };
}
