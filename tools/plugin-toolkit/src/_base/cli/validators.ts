// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import url from "url";
import includes from "lodash/includes";

const InvalidHostnameMessage =
    "Invalid hostname. Please provide a valid hostname in format [[https|http]://]host[:port]";

export function hostnameValidatorFactory(isBear: boolean) {
    return (input: string): boolean | string => {
        if (isEmpty(input)) {
            return InvalidHostnameMessage;
        }

        try {
            const { protocol } = url.parse(input);

            if (isBear) {
                if (protocol && protocol !== "https:") {
                    return "Provide hostname with https protocol or no protocol at all. ";
                }
            } else {
                if (protocol && !includes(["http:", "https:"], protocol)) {
                    return "Provide hostname with http or https protocol or no protocol at all.";
                }
            }

            // this will throw in case there is another problem with the URL
            new url.URL(`${protocol ? "" : "https://"}${input}`);

            return true;
        } catch (e: any) {
            return InvalidHostnameMessage;
        }
    };
}
