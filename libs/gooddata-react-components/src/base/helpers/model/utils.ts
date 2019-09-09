// (C) 2018 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import { DataLayer } from "@gooddata/gooddata-js";

const {
    Uri: { isUri },
} = DataLayer;

export const getQualifierObject = (qualifierString: string): VisualizationObject.ObjQualifier =>
    isUri(qualifierString)
        ? {
              uri: qualifierString,
          }
        : {
              identifier: qualifierString,
          };
