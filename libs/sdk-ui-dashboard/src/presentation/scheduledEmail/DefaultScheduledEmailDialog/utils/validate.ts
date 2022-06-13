// (C) 2019-2022 GoodData Corporation

const EMAIL_REGEX =
    // disabling as there are issues with the regex but we rather not touch it...
    // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function isEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
}
