import PlayerSocket, { Message } from './PlayerSocket';
import { DotPoint, ErrorCode, PathPoint, PositionType, RotationOption, ScaleOption } from './Interfaces';
declare class HapticPlayer {
    registeredKeys: string[];
    socket: PlayerSocket;
    constructor();
    addListener: (func: (msg: Message) => void) => void;
    turnOff: (key: string) => ErrorCode;
    turnOffAll: () => ErrorCode;
    submitDot: (key: string, pos: PositionType, dotPoints: DotPoint[], durationMillis: number) => ErrorCode;
    submitPath: (key: string, pos: PositionType, pathPoints: PathPoint[], durationMillis: number) => ErrorCode;
    registerFile: (key: string, json: string) => ErrorCode;
    submitRegistered: (key: string) => ErrorCode;
    submitRegisteredWithScaleOption: (key: string, scaleOption: ScaleOption) => ErrorCode;
    submitRegisteredWithRotationOption: (key: string, rotationOption: RotationOption) => ErrorCode;
}
export default HapticPlayer;
