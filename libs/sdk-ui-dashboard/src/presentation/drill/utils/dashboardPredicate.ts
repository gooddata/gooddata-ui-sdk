// (C) 2021 GoodData Corporation

import { areObjRefsEqual, Identifier, idRef, ObjRef } from "@gooddata/sdk-model";

/**
 * Tests whether a dashboard identifier OR dashboard ref match another dashboard's ref.
 *
 * You are reading this and probably wondering what the hell.. why is this crap here?! The situation is as follows:
 *
 * 1.  Each dashboard has 'ref', the type of ref is strictly controlled by the backend implementation. Some use
 *     URI's to reference dashboards, some use Identifiers. However as long as the backend creates refs consistently
 *     and the client treats them opaquely, then types match naturally and everything works.
 *
 * 2.  Enter drill to dashboard. For obscure reasons of the bear metadata, bear backend stored references
 *     as identifiers where everything else is URI. AND, this implementation detail leaks through the sdk-backend-bear.
 *
 * 3.  Result: When working on bear backend, simple areObjRefsEqual of refs are not enough because code could sometimes
 *     compare different types of refs.
 *
 * The code that you see here is a band-aid of that leaky abstraction. The right way would be to fix the sdk-backend-bear
 * so that the DrillToDashboard returns target ref of the correct, consistent type.
 */
export function dashboardMatch(identifier: Identifier, ref: ObjRef, otherRef: ObjRef): boolean {
    return areObjRefsEqual(ref, otherRef) || areObjRefsEqual(idRef(identifier), otherRef);
}
