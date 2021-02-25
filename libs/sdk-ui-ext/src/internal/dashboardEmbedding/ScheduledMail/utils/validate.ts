// (C) 2019-2020 GoodData Corporation

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function isEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
}
