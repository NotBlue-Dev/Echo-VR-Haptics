const WebSocket = require('ws');

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.tactJs = {})));
}(this, (function (exports) { 'use strict';

  (function (PositionType) {
      PositionType["VestFront"] = "VestFront";
      PositionType["VestBack"] = "VestBack";
      PositionType["Head"] = "Head";
      PositionType["ForearmL"] = "ForearmL";
      PositionType["ForearmR"] = "ForearmR";
  })(exports.PositionType || (exports.PositionType = {}));
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
  })(exports.ErrorCode || (exports.ErrorCode = {}));

  var DEFAULT_URL = 'ws://127.0.0.1:15881/v2/feedbacks?app_id=com.bhaptics.designer2&app_name=bHaptics Designer';
  var STATUS;
  (function (STATUS) {
      STATUS["CONNECTING"] = "Connecting";
      STATUS["CONNECTED"] = "Connected";
      STATUS["DISCONNECT"] = "Disconnected";
  })(STATUS || (STATUS = {}));
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
              _this.websocketClient.onerror = function (err) {
                  _this.currentStatus = STATUS.DISCONNECT;
                  _this.emit({
                      status: _this.currentStatus,
                      message: err.message,
                  });
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
                  return exports.ErrorCode.CONNECTION_NOT_ESTABLISHED;
              }
              if (!_this.isTriggered) {
                  _this.isTriggered = true;
                  _this.connect();
                  return exports.ErrorCode.CONNECTION_NOT_ESTABLISHED;
              }
              if (_this.websocketClient === undefined) {
                  return exports.ErrorCode.CONNECTION_NOT_ESTABLISHED;
              }
              if (_this.currentStatus !== STATUS.CONNECTED) {
                  return exports.ErrorCode.CONNECTION_NOT_ESTABLISHED;
              }
              try {
                  _this.websocketClient.send(message);
                  return exports.ErrorCode.SUCCESS;
              }
              catch (e) {
                  // sending failed
                  return exports.ErrorCode.FAILED_TO_SEND_MESSAGE;
              }
          };
          this.message = {};
          this.retryConnectTime = retryConnectTime;
          this.currentStatus = STATUS.DISCONNECT;
      }
      return PlayerSocket;
  }());

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
                  return exports.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
              }
              if (durationMillis < 20 || durationMillis > 100000) {
                  return exports.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
              }
              if (dotPoints === undefined) {
                  return exports.ErrorCode.MESSAGE_INVALID;
              }
              for (var i = 0; i < dotPoints.length; i++) {
                  var point = dotPoints[i];
                  switch (pos) {
                      case exports.PositionType.ForearmL:
                      case exports.PositionType.ForearmR:
                          if (isNaN(point.index)) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM;
                          }
                          if (point.index < 0 || point.index >= 6) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM;
                          }
                          break;
                      case exports.PositionType.Head:
                          if (isNaN(point.index)) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD;
                          }
                          if (point.index < 0 || point.index >= 6) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD;
                          }
                          break;
                      case exports.PositionType.VestBack:
                      case exports.PositionType.VestFront:
                          if (isNaN(point.index)) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST;
                          }
                          if (point.index < 0 || point.index >= 20) {
                              return exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST;
                          }
                          break;
                  }
                  if (isNaN(point.intensity)) {
                      return exports.ErrorCode.MESSAGE_INVALID_INTENSITY;
                  }
                  if (point.intensity < 0 || point.intensity > 100) {
                      return exports.ErrorCode.MESSAGE_INVALID_INTENSITY;
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
                  return exports.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
              }
              if (durationMillis < 20 || durationMillis > 100000) {
                  return exports.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS;
              }
              if (pathPoints === undefined) {
                  return exports.ErrorCode.MESSAGE_INVALID;
              }
              for (var i = 0; i < pathPoints.length; i++) {
                  var point = pathPoints[i];
                  if (isNaN(point.x)) {
                      return exports.ErrorCode.MESSAGE_INVALID_X;
                  }
                  if (isNaN(point.y)) {
                      return exports.ErrorCode.MESSAGE_INVALID_Y;
                  }
                  if (isNaN(point.intensity)) {
                      return exports.ErrorCode.MESSAGE_INVALID_INTENSITY;
                  }
                  if (point.x < 0 || point.x > 1) {
                      return exports.ErrorCode.MESSAGE_INVALID_X;
                  }
                  if (point.y < 0 || point.y > 1) {
                      return exports.ErrorCode.MESSAGE_INVALID_Y;
                  }
                  if (point.intensity < 0 || point.intensity > 100) {
                      return exports.ErrorCode.MESSAGE_INVALID_INTENSITY;
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
                  return exports.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
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
                  return exports.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
              }
              if (isNaN(scaleOption.intensity)) {
                  return exports.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO;
              }
              if (scaleOption.intensity < 0.2 || scaleOption.intensity > 5) {
                  return exports.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO;
              }
              if (isNaN(scaleOption.duration)) {
                  return exports.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO;
              }
              if (scaleOption.duration < 0.2 || scaleOption.duration > 5) {
                  return exports.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO;
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
                  return exports.ErrorCode.MESSAGE_NOT_REGISTERED_KEY;
              }
              if (isNaN(rotationOption.offsetAngleX)) {
                  return exports.ErrorCode.MESSAGE_INVALID_ROTATION_X;
              }
              if (rotationOption.offsetAngleX < 0 || rotationOption.offsetAngleX > 360) {
                  return exports.ErrorCode.MESSAGE_INVALID_ROTATION_X;
              }
              if (isNaN(rotationOption.offsetY)) {
                  return exports.ErrorCode.MESSAGE_INVALID_ROTATION_Y;
              }
              if (rotationOption.offsetY < -0.5 || rotationOption.offsetY > 0.5) {
                  return exports.ErrorCode.MESSAGE_INVALID_ROTATION_Y;
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
          this.socket = new PlayerSocket();
          this.addListener((function (msg) {
              if (msg.message.RegisteredKeys) {
                  _this.registeredKeys = msg.message.RegisteredKeys;
              }
          }));
      }
      return HapticPlayer;
  }());

  var tactJs = new HapticPlayer();
  var TactJsUtils = /** @class */ (function () {
      function TactJsUtils() {
      }
      TactJsUtils.convertErrorCodeToString = function (error) {
          switch (error) {
              case exports.ErrorCode.CONNECTION_NOT_ESTABLISHED:
                  return 'Connection is not established.';
              case exports.ErrorCode.FAILED_TO_SEND_MESSAGE:
                  return 'Failed to send a request to the bHaptics Player';
              case exports.ErrorCode.MESSAGE_NOT_DEFINED:
                  return 'Message is not defined';
              case exports.ErrorCode.MESSAGE_INVALID:
                  return 'Invalid input: Unknown';
              case exports.ErrorCode.MESSAGE_INVALID_DURATION_MILLIS:
                  return 'Invalid: durationMillis [20ms ~ 100,000ms]';
              case exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_VEST:
                  return 'Invalid: VestFront/Back index should be [0, 19]';
              case exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_ARM:
                  return 'Invalid: ArmLeft/Right index should be [0, 5]';
              case exports.ErrorCode.MESSAGE_INVALID_DOT_INDEX_HEAD:
                  return 'Invalid: Head index should be [0, 5]';
              case exports.ErrorCode.MESSAGE_INVALID_INTENSITY:
                  return 'Invalid: intensity should be [0, 100]';
              case exports.ErrorCode.MESSAGE_INVALID_X:
                  return 'Invalid: x should be [0, 1]';
              case exports.ErrorCode.MESSAGE_INVALID_Y:
                  return 'Invalid: y should be [0, 1]';
              case exports.ErrorCode.MESSAGE_INVALID_ROTATION_X:
                  return 'Invalid: rotationOffsetX should be [0, 360]';
              case exports.ErrorCode.MESSAGE_INVALID_ROTATION_Y:
                  return 'Invalid: offsetY should be [-0.5, 0.5]';
              case exports.ErrorCode.MESSAGE_INVALID_SCALE_INTENSITY_RATIO:
                  return 'Invalid: intensity should be [0.2, 5]';
              case exports.ErrorCode.MESSAGE_INVALID_SCALE_DURATION_RATIO:
                  return 'Invalid: duration should be [0.2, 5]';
              case exports.ErrorCode.MESSAGE_NOT_REGISTERED_KEY:
                  return 'Invalid: key not registered';
              case exports.ErrorCode.SUCCESS:
                  return 'Success';
          }
      };
      return TactJsUtils;
  }());

  exports.default = tactJs;
  exports.TactJsUtils = TactJsUtils;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=tact-js.umd.js.map
