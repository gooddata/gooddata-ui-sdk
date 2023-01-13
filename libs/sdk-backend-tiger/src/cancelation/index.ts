// (C) 2019-2023 GoodData Corporation
import axios, { AxiosRequestConfig } from "axios";

export class TigerCancellationConverter {
    constructor(private readonly signal: AbortSignal | null) {}

    public forAxios(): Pick<AxiosRequestConfig, "cancelToken"> {
        const { signal } = this;

        if (!signal) {
            return {};
        }

        const source = axios.CancelToken.source();

        signal.addEventListener("abort", () => source.cancel());

        return {
            cancelToken: source.token,
        };
    }
}
