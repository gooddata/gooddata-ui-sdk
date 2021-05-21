// (C) 2019-2021 GoodData Corporation
import { useEffect, useState } from "react";
import noop from "lodash/noop";

export interface IUseDynamicScriptConfig {
    url: string;
    debug?: boolean;
}

export interface IUseDynamicScriptResult {
    ready: boolean;
    failed: boolean;
}

export const useDynamicScript = (args: IUseDynamicScriptConfig): IUseDynamicScriptResult => {
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!args.url) {
            return;
        }

        // eslint-disable-next-line no-console
        const log = args.debug ? console.log : noop;
        // eslint-disable-next-line no-console
        const logError = args.debug ? console.error : noop;

        const element = document.createElement("script");

        element.src = args.url;
        element.type = "text/javascript";
        element.async = true;

        setReady(false);
        setFailed(false);

        element.onload = () => {
            log(`Dynamic Script Loaded: ${args.url}`);
            setReady(true);
        };

        element.onerror = () => {
            logError(`Dynamic Script Error: ${args.url}`);
            setReady(false);
            setFailed(true);
        };

        document.head.appendChild(element);

        return () => {
            log(`Dynamic Script Removed: ${args.url}`);
            document.head.removeChild(element);
        };
    }, [args.url]);

    return {
        ready,
        failed,
    };
};
