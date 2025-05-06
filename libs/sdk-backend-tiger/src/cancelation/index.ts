// (C) 2019-2025 GoodData Corporation
import { AxiosRequestConfig } from "axios";

export class TigerCancellationConverter {
    constructor(private readonly signal: AbortSignal | null) {}

    public forAxios(): Pick<AxiosRequestConfig, "cancelToken" | "signal"> {
        const { signal } = this;

        if (!signal) {
            return {};
        }

        return {
            signal,
        };
    }
}
