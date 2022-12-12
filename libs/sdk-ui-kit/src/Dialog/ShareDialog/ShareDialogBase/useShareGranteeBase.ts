// (C) 2022 GoodData Corporation
import { useState, useEffect } from "react";
import { ObjRef } from "@gooddata/sdk-model";

import { IShareGranteeBaseProps } from "../ShareDialogBase/types";

/**
 * @internal
 */
interface IUseShareGranteeBaseStateReturnType {
    messageVisibility: boolean;
    handleLocalStorageClose: () => void;
}

/**
 * @internal
 */
interface IAdminMessage {
    isVisible: boolean;
}

/**
 * @internal
 */
const LOCAL_STORAGE_KEY_PREFIX = "gdc_share_granular_dialog_";

/**
 * @internal
 */
const createLocalStorageKey = (currentUserRef: ObjRef): string => LOCAL_STORAGE_KEY_PREFIX + currentUserRef;

/**
 * @internal
 */
const setLocalStorageKey = (key: string, value: string) => localStorage.setItem(key, value);

/**
 * @internal
 */
const getLocalStorageKey = (key: string): boolean => {
    const localStoragekey: IAdminMessage = JSON.parse(localStorage.getItem(key));

    return localStoragekey && localStoragekey.isVisible ? true : false;
};

/**
 * @internal
 */
export const useShareGranteeBaseState = (
    props: IShareGranteeBaseProps,
): IUseShareGranteeBaseStateReturnType => {
    const { currentUserRef } = props;

    const showMessage = getLocalStorageKey(createLocalStorageKey(currentUserRef));
    const [messageVisibility, setMessageVisibility] = useState<boolean>(showMessage);

    useEffect(() => {
        localStorageMessageVisibility(currentUserRef);
    }, []);

    const localStorageMessageVisibility = (currentUserRef: ObjRef) => {
        const key = createLocalStorageKey(currentUserRef);
        const localStoragekey = localStorage.getItem(key);

        if (localStoragekey) {
            const adminMessage: IAdminMessage = JSON.parse(localStoragekey);
            setMessageVisibility(adminMessage.isVisible);
        } else {
            setLocalStorageKey(key, JSON.stringify({ isVisible: true }));
            setMessageVisibility(true);
        }
    };

    const handleLocalStorageClose = () => {
        setLocalStorageKey(createLocalStorageKey(currentUserRef), JSON.stringify({ isVisible: false }));
        setMessageVisibility(false);
    };

    return {
        messageVisibility,
        handleLocalStorageClose,
    };
};
