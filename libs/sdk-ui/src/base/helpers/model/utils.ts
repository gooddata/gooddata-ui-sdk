// (C) 2018 GoodData Corporation
import { ObjQualifier } from "@gooddata/sdk-model";

// TODO: SDK8: this should probably go away; switching as-is for now and removing dep on bear client

const REG_URI_OBJ = /\/gdc\/md\/(\S+)\/obj\/\d+/;
const isUri = (identifier: string) => REG_URI_OBJ.test(identifier);

export const getQualifierObject = (qualifierString: string): ObjQualifier =>
    isUri(qualifierString)
        ? {
              uri: qualifierString,
          }
        : {
              identifier: qualifierString,
          };
