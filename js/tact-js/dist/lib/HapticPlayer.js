"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlayerSocket_1 = require("./PlayerSocket");
var Interfaces_1 = require("./Interfaces");
var HapticPlayer = /** @class */ (function () {
    function HapticPlayer() {
        var _this = this;
        this.registeredKeys = [];
        this.addListener = function (func) {
            _this.socket.addListener(func);
        };
        this.turnOff = function (key) {
            var request = {
                Submit: [{
                        Type: 'turnOff',
                        Key: key,
                    }],
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.turnOffAll = function () {
            var request = {
                Submit: [{
                        Type: 'turnOffAll',
                    }],
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.submitDot = function (key, pos, dotPoints, durationMillis) {
            if (isNaN(durationMillis)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
            }
            if (durationMillis < 20 || durationMillis > 100000) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
            }
            if (dotPoints === undefined) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID;
            }
            for (var i = 0; i < dotPoints.length; i++) {
                var point = dotPoints[i];
                switch (pos) {
                    case Interfaces_1.PositionType.ForearmL:
                    case Interfaces_1.PositionType.ForearmR:
                        if (isNaN(point.index)) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM;
                        }
                        if (point.index < 0 || point.index >= 6) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM;
                        }
                        break;
                    case Interfaces_1.PositionType.Head:
                        if (isNaN(point.index)) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD;
                        }
                        if (point.index < 0 || point.index >= 6) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD;
                        }
                        break;
                    case Interfaces_1.PositionType.VestBack:
                    case Interfaces_1.PositionType.VestFront:
                        if (isNaN(point.index)) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST;
                        }
                        if (point.index < 0 || point.index >= 20) {
                            return Interfaces_1.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST;
                        }
                        break;
                }
                if (isNaN(point.intensity)) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_INTENSITY;
                }
                if (point.intensity < 0 || point.intensity > 100) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_INTENSITY;
                }
            }
            var request = {
                Submit: [{
                        Type: 'frame',
                        Key: key,
                        Frame: {
                            Position: pos,
                            PathPoints: [],
                            DotPoints: dotPoints,
                            DurationMillis: durationMillis,
                        },
                    }],
            };
            return _this.socket.send(JSON.stringify(request, function (k, val) {
                return val.toFixed ? Number(val.toFixed(3)) : val;
            }));
        };
        this.submitPath = function (key, pos, pathPoints, durationMillis) {
            if (isNaN(durationMillis)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
            }
            if (durationMillis < 20 || durationMillis > 100000) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
            }
            if (pathPoints === undefined) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID;
            }
            for (var i = 0; i < pathPoints.length; i++) {
                var point = pathPoints[i];
                if (isNaN(point.x)) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_X;
                }
                if (isNaN(point.y)) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_Y;
                }
                if (isNaN(point.intensity)) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_INTENSITY;
                }
                if (point.x < 0 || point.x > 1) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_X;
                }
                if (point.y < 0 || point.y > 1) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_Y;
                }
                if (point.intensity < 0 || point.intensity > 100) {
                    return Interfaces_1.ErrorCode.MESSAGE_INVALID_INTENSITY;
                }
            }
            var request = {
                Submit: [{
                        Type: 'frame',
                        Key: key,
                        Frame: {
                            Position: pos,
                            PathPoints: pathPoints,
                            DotPoints: [],
                            DurationMillis: durationMillis,
                        },
                    }],
            };
            return _this.socket.send(JSON.stringify(request, function (k, val) {
                return val.toFixed ? Number(val.toFixed(3)) : val;
            }));
        };
        this.registerFile = function (key, json) {
            var jsonData = JSON.parse(json);
            var project = jsonData["project"];
            var request = {
                Register: [{
                        Key: key,
                        project: project,
                    }]
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.submitRegistered = function (key) {
            if (_this.registeredKeys.find(function (v) { return v === key; }) === undefined) {
                return Interfaces_1.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
            }
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                    }],
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.submitRegisteredWithScaleOption = function (key, scaleOption) {
            if (_this.registeredKeys.find(function (v) { return v === key; }) === undefined) {
                return Interfaces_1.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
            }
            if (isNaN(scaleOption.intensity)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO;
            }
            if (scaleOption.intensity < 0.2 || scaleOption.intensity > 5) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO;
            }
            if (isNaN(scaleOption.duration)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO;
            }
            if (scaleOption.duration < 0.2 || scaleOption.duration > 5) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO;
            }
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                        Parameters: {
                            scaleOption: scaleOption,
                        }
                    }],
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.submitRegisteredWithRotationOption = function (key, rotationOption) {
            if (_this.registeredKeys.find(function (v) { return v === key; }) === undefined) {
                return Interfaces_1.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
            }
            if (isNaN(rotationOption.offsetAngleX)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_X;
            }
            if (rotationOption.offsetAngleX < 0 || rotationOption.offsetAngleX > 360) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_X;
            }
            if (isNaN(rotationOption.offsetY)) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_Y;
            }
            if (rotationOption.offsetY < -0.5 || rotationOption.offsetY > 0.5) {
                return Interfaces_1.ErrorCode.MESSAGE_INVALID_ROTATION_Y;
            }
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                        Parameters: {
                            rotationOption: rotationOption,
                        }
                    }],
            };
            return _this.socket.send(JSON.stringify(request));
        };
        this.socket = new PlayerSocket_1.default();
        this.addListener((function (msg) {
            if (msg.message.RegisteredKeys) {
                _this.registeredKeys = msg.message.RegisteredKeys;
            }
        }));
    }
    return HapticPlayer;
}());
exports.default = HapticPlayer;
//# sourceMappingURL=HapticPlayer.js.map