"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PositionType;
(function (PositionType) {
    PositionType["VestFront"] = "VestFront";
    PositionType["VestBack"] = "VestBack";
    PositionType["Head"] = "Head";
    PositionType["ForearmL"] = "ForearmL";
    PositionType["ForearmR"] = "ForearmR";
})(PositionType = exports.PositionType || (exports.PositionType = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["MESSAGE_NOT_DEFINED"] = 1] = "MESSAGE_NOT_DEFINED";
    ErrorCode[ErrorCode["CONNECTION_NOT_ESTABLISHED"] = 2] = "CONNECTION_NOT_ESTABLISHED";
    ErrorCode[ErrorCode["FAILED_TO_SEND_MESSAGE"] = 3] = "FAILED_TO_SEND_MESSAGE";
    ErrorCode[ErrorCode["MESSAGE_INVALID"] = 4] = "MESSAGE_INVALID";
    ErrorCode[ErrorCode["MESSAGE_INVALID_DURATION_MILLIS"] = 5] = "MESSAGE_INVALID_DURATION_MILLIS";
    ErrorCode[ErrorCode["MESSAGE_INVALID_DOT_INDEX_HEAD"] = 6] = "MESSAGE_INVALID_DOT_INDEX_HEAD";
    ErrorCode[ErrorCode["MESSAGE_INVALID_DOT_INDEX_ARM"] = 7] = "MESSAGE_INVALID_DOT_INDEX_ARM";
    ErrorCode[ErrorCode["MESSAGE_INVALID_DOT_INDEX_VEST"] = 8] = "MESSAGE_INVALID_DOT_INDEX_VEST";
    ErrorCode[ErrorCode["MESSAGE_INVALID_INTENSITY"] = 9] = "MESSAGE_INVALID_INTENSITY";
    ErrorCode[ErrorCode["MESSAGE_INVALID_X"] = 10] = "MESSAGE_INVALID_X";
    ErrorCode[ErrorCode["MESSAGE_INVALID_Y"] = 11] = "MESSAGE_INVALID_Y";
    ErrorCode[ErrorCode["MESSAGE_INVALID_ROTATION_X"] = 12] = "MESSAGE_INVALID_ROTATION_X";
    ErrorCode[ErrorCode["MESSAGE_INVALID_ROTATION_Y"] = 13] = "MESSAGE_INVALID_ROTATION_Y";
    ErrorCode[ErrorCode["MESSAGE_INVALID_SCALE_INTENSITY_RATIO"] = 14] = "MESSAGE_INVALID_SCALE_INTENSITY_RATIO";
    ErrorCode[ErrorCode["MESSAGE_INVALID_SCALE_DURATION_RATIO"] = 15] = "MESSAGE_INVALID_SCALE_DURATION_RATIO";
    ErrorCode[ErrorCode["MESSAGE_NOT_REGISTERED_KEY"] = 16] = "MESSAGE_NOT_REGISTERED_KEY";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
//# sourceMappingURL=Interfaces.js.map