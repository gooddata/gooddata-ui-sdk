// (C) 2019-2026 GoodData Corporation

const EMAIL_REGEX =
    // disabling as there are issues with the regex but we rather not touch it...
    /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]|(?:[a-z0-9-]+\.)+[a-z]{2,})$/i;

export function isEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
}
