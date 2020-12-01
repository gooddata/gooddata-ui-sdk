// (C) 2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    DefaultLocale,
    GoodDataSdkError,
    ILocale,
    OnError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";
import { useRef } from "react";

interface IUseLocaleConfig {
    locale?: ILocale;
    backend?: IAnalyticalBackend;
    onError?: OnError;
}

export const useLocale = ({
    backend,
    locale,
    onError,
}: IUseLocaleConfig): UseCancelablePromiseState<ILocale, GoodDataSdkError> => {
    const effectiveBackend = useBackend(backend);

    const cachedLocale = useRef(locale);

    return useCancelablePromise(
        {
            promise: async () => {
                if (cachedLocale.current) {
                    return cachedLocale.current;
                }

                cachedLocale.current = await effectiveBackend
                    .currentUser()
                    .settings()
                    .getSettings()
                    .then((settings) => settings.locale as ILocale)
                    .catch((error) => {
                        cachedLocale.current = DefaultLocale;
                        throw error;
                    });

                return cachedLocale.current;
            },
            onError,
        },
        [effectiveBackend, locale],
    );
};
