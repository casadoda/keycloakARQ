export class Exception extends Error {
    constructor(public message: string, public data?: any) {
        super(message);
    }
}