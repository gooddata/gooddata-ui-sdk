// (C) 2021 GoodData Corporation
import url from "url";

export function sanitizeHostname(hostname: string): string {
    const { protocol } = url.parse(hostname);

    return protocol ? hostname : `https://${hostname}`;
}
