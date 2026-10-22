// (C) 2026 GoodData Corporation

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type ObjRef, type ObjectType, idRef, isIdentifierRef, objRefToString } from "@gooddata/sdk-model";

// Key ignores the identifier ref's optional object type (typed and untyped identifier
// refs are equivalent under areObjRefsEqual) but keeps the ref kind, so an identifier
// and a URI with the same string stay distinct.
export function refKey(ref: ObjRef): string {
    return isIdentifierRef(ref) ? `id:${ref.identifier}` : `uri:${ref.uri}`;
}

// JSON round-trip detaches stored state from caller-held objects on both the
// write and the read side, the way a real backend's serialization does.
export function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

interface IStoredPublisherEntity {
    ref: ObjRef;
    isLocked?: boolean;
}

export class InMemoryPublisherStore<T extends IStoredPublisherEntity> {
    private readonly entities = new Map<string, T>();
    private sequence = 0;

    constructor(
        private readonly refType: ObjectType,
        private readonly what: string,
    ) {}

    public list(): T[] {
        return deepClone([...this.entities.values()]);
    }

    public get(ref: ObjRef): T {
        return deepClone(this.existing(ref));
    }

    public newRef(): ObjRef {
        let ref: ObjRef;
        do {
            this.sequence += 1;
            ref = idRef(`${this.refType}_${this.sequence}`, this.refType);
        } while (this.entities.has(refKey(ref)));
        return ref;
    }

    public add(entity: T): T {
        const key = refKey(entity.ref);
        if (this.entities.has(key)) {
            throw new UnexpectedError(`${this.what} "${objRefToString(entity.ref)}" already exists.`);
        }
        this.entities.set(key, deepClone(entity));
        return deepClone(entity);
    }

    public replace(entity: T): T {
        this.assertEditable(entity.ref);
        this.entities.set(refKey(entity.ref), deepClone(entity));
        return deepClone(entity);
    }

    public remove(ref: ObjRef): void {
        this.assertEditable(ref);
        this.entities.delete(refKey(ref));
    }

    private existing(ref: ObjRef): T {
        const entity = this.entities.get(refKey(ref));
        if (!entity) {
            throw new UnexpectedError(`${this.what} "${objRefToString(ref)}" does not exist.`);
        }
        return entity;
    }

    private assertEditable(ref: ObjRef): void {
        if (this.existing(ref).isLocked) {
            throw new UnexpectedError(`${this.what} "${objRefToString(ref)}" is locked.`);
        }
    }
}
