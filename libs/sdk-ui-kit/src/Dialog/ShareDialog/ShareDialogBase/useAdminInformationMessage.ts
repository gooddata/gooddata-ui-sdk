// (C) 2023-2024 GoodData Corporation

import { useMemo } from "react";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import { useLocalStorage } from "@gooddata/sdk-ui";

const LOCAL_STORAGE_KEY_PREFIX = "gdc_share_dialog_admin_message_visible_";

const createLocalStorageKey = (currentUserRef: ObjRef): string =>
    LOCAL_STORAGE_KEY_PREFIX + stringUtils.simplifyText(objRefToString(currentUserRef));

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
