"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Interfaces_1 = require("./Interfaces");
var DEFAULT_URL = 'ws://127.0.0.1:15881/v2/feedbacks?app_id=com.bhaptics.designer2&app_name=bHaptics Designer';
var STATUS;
(function (STATUS) {
    STATUS["CONNECTING"] = "Connecting";
    STATUS["CONNECTED"] = "Connected";
    STATUS["DISCONNECT"] = "Disconnected";
})(STATUS = exports.STATUS || (exports.STATUS = {}));
var DEFAULT_RETRY_CONNECT_TIME = 5000;
var PlayerSocket = /** @class */ (function () {
    function PlayerSocket(retryConnectTime) {
        var _this = this;
        if (retryConnectTime === void 0) { retryConnectTime = DEFAULT_RETRY_CONNECT_TIME; }
        this.handlers = [];
        this.isTriggered = false;
        this.addListener = function (func) {
            _this.handlers.push(func);
        };
        this.emit = function (msg) {
            _this.handlers.forEach(function (func) {
                func(msg);
            });
        };
        this.connect = function () {
            try {
                _this.websocketClient = new WebSocket(DEFAULT_URL);
            }
            catch (e) {
                // connection failed
                console.log('PlayerSocket', e);
                return;
            }
            _this.websocketClient.onopen = function () {
                _this.currentStatus = STATUS.CONNECTED;
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
            };
            _this.websocketClient.onmessage = function (result) {
                if (JSON.stringify(_this.message) === result.data) {
                    return;
                }
                _this.message = JSON.parse(result.data);
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
            };
            _this.websocketClient.onclose = function (event) {
                _this.currentStatus = STATUS.DISCONNECT;
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
                setTimeout(function () {
                    _this.connect();
                }, _this.retryConnectTime);
            };
            _this.currentStatus = STATUS.CONNECTING;
            _this.emit({
                status: _this.currentStatus,
                message: _this.message,
            });
        };
        this.send = function (message) {
            if (message === undefined) {
                return Interfaces_1.ErrorCode.CONNECTION_NOT_ESTABLISHED;
            }
            if (!_this.isTriggered) {
                _this.isTriggered = true;
                _this.connect();
                return Interfaces_1.ErrorCode.CONNECTION_NOT_ESTABLISHED;
            }
            if (_this.websocketClient === undefined) {
                return Interfaces_1.ErrorCode.CONNECTION_NOT_ESTABLISHED;
            }
            if (_this.currentStatus !== STATUS.CONNECTED) {
                return Interfaces_1.ErrorCode.CONNECTION_NOT_ESTABLISHED;
            }
            try {
                _this.websocketClient.send(message);
                return Interfaces_1.ErrorCode.SUCCESS;
            }
            catch (e) {
                // sending failed
                return Interfaces_1.ErrorCode.FAILED_TO_SEND_MESSAGE;
            }
        };
        this.message = {};
        this.retryConnectTime = retryConnectTime;
        this.currentStatus = STATUS.DISCONNECT;
    }
    return PlayerSocket;
}());
exports.default = PlayerSocket;
//# sourceMappingURL=PlayerSocket.js.map