export interface DotPoint {
    index: number;
    intensity: number;
}
export interface PathPoint {
    x: number;
    y: number;
    intensity: number;
}
export interface ScaleOption {
    intensity: number;
    duration: number;
}
export interface RotationOption {
    offsetAngleX: number;
    offsetY: number;
}
export declare enum PositionType {
    VestFront = "VestFront",
    VestBack = "VestBack",
    Head = "Head",
    ForearmL = "ForearmL",
    ForearmR = "ForearmR"
}
export declare enum ErrorCode {
    SUCCESS = 0,
    MESSAGE_NOT_DEFINED = 1,
    CONNECTION_NOT_ESTABLISHED = 2,
    FAILED_TO_SEND_MESSAGE = 3,
    MESSAGE_INVALID = 4,
    MESSAGE_INVALID_DURATION_MILLIS = 5,
    MESSAGE_INVALID_DOT_INDEX_HEAD = 6,
    MESSAGE_INVALID_DOT_INDEX_ARM = 7,
    MESSAGE_INVALID_DOT_INDEX_VEST = 8,
    MESSAGE_INVALID_INTENSITY = 9,
    MESSAGE_INVALID_X = 10,
    MESSAGE_INVALID_Y = 11,
    MESSAGE_INVALID_ROTATION_X = 12,
    MESSAGE_INVALID_ROTATION_Y = 13,
    MESSAGE_INVALID_SCALE_INTENSITY_RATIO = 14,
    MESSAGE_INVALID_SCALE_DURATION_RATIO = 15,
    MESSAGE_NOT_REGISTERED_KEY = 16
}
