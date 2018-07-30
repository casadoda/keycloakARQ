import { Exception } from './exception';

/**
 * SegurCaixa Adeslas security exception.
 */
export class SecurityException extends Exception {
    constructor(public roles: string[],
        public functionality: string,
        public message: string,
        public data?: any) {
        super(message, data);
    }
}
