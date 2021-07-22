import { ErrorCode } from './Interfaces';
export declare enum STATUS {
    CONNECTING = "Connecting",
    CONNECTED = "Connected",
    DISCONNECT = "Disconnected"
}
export interface Message {
    status: STATUS;
    message: any;
}
export default class PlayerSocket {
    private handlers;
    private websocketClient;
    private currentStatus;
    private message;
    private isTriggered;
    retryConnectTime: number;
    constructor(retryConnectTime?: number);
    addListener: (func: (msg: Message) => void) => void;
    private emit;
    connect: () => void;
    send: (message: string) => ErrorCode;
}
