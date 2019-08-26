// (C) 2007-2018 GoodData Corporation
export const REG_URI_OBJ = /\/gdc\/md\/(\S+)\/obj\/\d+/;

export const isUri = (identifier: string) => REG_URI_OBJ.test(identifier);
export const areUris = (identifiers: string[]) => identifiers.every(isUri);
