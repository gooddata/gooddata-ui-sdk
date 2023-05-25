// (C) 2023 GoodData Corporation

import { useEffect, useMemo, useState } from "react";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import isNil from "lodash/isNil.js";

const LOCAL_STORAGE_KEY_PREFIX = "gdc_share_dialog_admin_message_visible_";

const createLocalStorageKey = (currentUserRef: ObjRef): string =>
    LOCAL_STORAGE_KEY_PREFIX + stringUtils.simplifyText(objRefToString(currentUserRef));

const getLocalStorageValue = <T>(key: string, defaultValue: T) => {
    const item = localStorage.getItem(key);
    const value = JSON.parse(item);

    return isNil(value) ? defaultValue : value;
};

export const useLocalStorage = <T>(
    key: string,
    defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => getLocalStorageValue(key, defaultValue));

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};

interface IUseAdminInformationMessageStateReturnType {
    isMessageVisible: boolean;
    handleMessageClose: () => void;
}

export const useAdminInformationMessageState = (
    currentUserRef: ObjRef,
): IUseAdminInformationMessageStateReturnType => {
    const localStorageKey = useMemo(() => createLocalStorageKey(currentUserRef), [currentUserRef]);
    const [isMessageVisible, setIsMessageVisible] = useLocalStorage<boolean>(localStorageKey, true);
    const handleMessageClose = () => setIsMessageVisible(false);

    return {
        isMessageVisible,
        handleMessageClose,
    };
};
