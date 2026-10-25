// (C) 2007-2026 GoodData Corporation

export const SSO_LOGIN_COOKIE = "GDCSSOLogin";

export function isLoggedInViaSso(docInstance: Document = document) {
    return docInstance.cookie.indexOf(SSO_LOGIN_COOKIE) !== -1;
}
