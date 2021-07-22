"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HapticPlayer_1 = require("./HapticPlayer");
var Interfaces_1 = require("./Interfaces");
exports.PositionType = Interfaces_1.PositionType;
exports.ErrorCode = Interfaces_1.ErrorCode;
var tactJs = new HapticPlayer_1.default();
exports.default = tactJs;
var TactJsUtils = /** @class */ (function () {
    function TactJsUtils() {
    }
    TactJsUtils.convertErrorCodeToString = function (error) {
        switch (error) {
            case Interfaces_1.ErrorCode.CONNECTION_NOT_ESTABLISHED:
                return 'Connection is not established.';
            case Interfaces_1.ErrorCode.FAILED_TO_SEND_MESSAGE:
                return 'Failed to send a request to the bHaptics Player';
            case Interfaces_1.ErrorCode.MESSAGE_NOT_DEFINED:
                return 'Message is not defined';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID:
                return 'Invalid input: Unknown';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS:
                return 'Invalid: durationMillis [20ms ~ 100,000ms]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST:
                return 'Invalid: VestFront/Back index should be [0, 19]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM:
                return 'Invalid: ArmLeft/Right index should be [0, 5]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD:
                return 'Invalid: Head index should be [0, 5]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_INTENSITY:
                return 'Invalid: intensity should be [0, 100]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_X:
                return 'Invalid: x should be [0, 1]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_Y:
                return 'Invalid: y should be [0, 1]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_X:
                return 'Invalid: rotationOffsetX should be [0, 360]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_Y:
                return 'Invalid: offsetY should be [-0.5, 0.5]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO:
                return 'Invalid: intensity should be [0.2, 5]';
            case Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO:
                return 'Invalid: duration should be [0.2, 5]';
            case Interfaces_1.ErrorCode.MESSAGE_NOT_REGISTERED_KEY:
                return 'Invalid: key not registered';
            case Interfaces_1.ErrorCode.SUCCESS:
                return 'Success';
        }
    };
    return TactJsUtils;
}());
exports.TactJsUtils = TactJsUtils;
//# sourceMappingURL=tact-js.js.map