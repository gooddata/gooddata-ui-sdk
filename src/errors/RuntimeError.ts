export class RuntimeError extends Error {
    constructor(public message: string, public cause?: Error) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }

    public getMessage() {
        return this.message;
    }

    public getCause() {
        return this.cause;
    }
}
