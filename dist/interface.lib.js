(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Button with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the buttons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module Button
 * @augments CanvasWidget
 */

var Button = Object.create(_canvasWidget2.default);

Object.assign(Button, {

  /** @lends Button.prototype */

  /**
   * A set of default property settings for all Button instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Button
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    active: false,

    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the Button instance.
     * @memberof Button
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new Button instance.
   * @memberof Button
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Button instance with.
   * @static
   */
  create: function create(props) {
    var button = Object.create(this);

    _canvasWidget2.default.create.call(button);

    Object.assign(button, Button.defaults, props);

    if (props.value) button.__value = props.value;

    button.init();

    return button;
  },


  /**
   * Draw the Button into its canvas context using the current .__value property and button style.
   * @memberof Button
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      var _this = this;

      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      if (this.style === 'hold') {
        this.active = true;
        this.pointerId = e.pointerId;
        window.addEventListener('pointerup', this.pointerup);
      }

      if (this.style === 'toggle') {
        this.__value = this.__value === 1 ? 0 : 1;
      } else if (this.style === 'momentary') {
        this.__value = 1;
        setTimeout(function () {
          _this.__value = 0;_this.draw();
        }, 50);
      } else if (this.style === 'hold') {
        this.__value = 1;
      }

      this.output();

      this.draw();
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId && this.style === 'hold') {
        this.active = false;

        window.removeEventListener('pointerup', this.pointerup);

        this.__value = 0;
        this.output();

        this.draw();
      }
    }
  }
});

exports.default = Button;

},{"./canvasWidget":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget');

var _domWidget2 = _interopRequireDefault(_domWidget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

var _widgetLabel = require('./widgetLabel');

var _widgetLabel2 = _interopRequireDefault(_widgetLabel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CanvasWidget is the base class for widgets that use HTML canvas elements.
 * @module CanvasWidget
 * @augments DOMWidget
 */

var CanvasWidget = Object.create(_domWidget2.default);

Object.assign(CanvasWidget, {
  /** @lends CanvasWidget.prototype */

  /**
   * A set of default colors and canvas context properties for use in CanvasWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    background: '#888',
    fill: '#aaa',
    stroke: 'rgba(255,255,255,.3)',
    lineWidth: 4,
    defaultLabel: {
      x: .5, y: .5, align: 'center', width: 1, text: 'demo'
    },
    shouldDisplayValue: false
  },
  /**
   * Create a new CanvasWidget instance
   * @memberof CanvasWidget
   * @constructs
   * @static
   */
  create: function create(props) {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _domWidget2.default.create.call(this);

    Object.assign(this, CanvasWidget.defaults);

    /**
     * Store a reference to the canvas 2D context.
     * @memberof CanvasWidget
     * @instance
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.element.getContext('2d');

    this.applyHandlers(shouldUseTouch);
  },


  /**
   * Create a the canvas element used by the widget and set
   * some default CSS values.
   * @memberof CanvasWidget
   * @static
   */
  createElement: function createElement() {
    var element = document.createElement('canvas');
    element.setAttribute('touch-action', 'none');
    element.style.position = 'absolute';
    element.style.display = 'block';

    return element;
  },
  applyHandlers: function applyHandlers() {
    var _this = this;

    var shouldUseTouch = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var handlers = shouldUseTouch ? CanvasWidget.handlers.touch : CanvasWidget.handlers.mouse;

    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var handlerName = _step.value;

        _this.element.addEventListener(handlerName, function (event) {
          if (typeof _this['on' + handlerName] === 'function') _this['on' + handlerName](event);
        });
      };

      for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },


  handlers: {
    mouse: ['mouseup', 'mousemove', 'mousedown'],
    touch: []
  },

  addLabel: function addLabel() {
    var props = Object.assign({ ctx: this.ctx }, this.label || this.defaultLabel),
        label = _widgetLabel2.default.create(props);

    this.label = label;
    this._draw = this.draw;
    this.draw = function () {
      this._draw();
      this.label.draw();
    };
  },
  __addToPanel: function __addToPanel(panel) {
    var _this2 = this;

    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();

    if (this.label || this.shouldDisplayValue) this.addLabel();
    if (this.shouldDisplayValue) {
      this.__postfilters.push(function (value) {
        _this2.label.text = value.toFixed(5);
        return value;
      });
    }
    this.draw();
  }
});

exports.default = CanvasWidget;

},{"./domWidget":4,"./utilities":15,"./widgetLabel":17}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Communication = {
  Socket: null,
  initialized: false,

  init: function init() {
    var _this = this;

    this.Socket = new WebSocket(this.getServerAddress());
    this.Socket.onmessage = this.onmessage;

    var fullLocation = window.location.toString(),
        locationSplit = fullLocation.split('/'),
        interfaceName = locationSplit[locationSplit.length - 1];

    this.Socket.onopen = function () {
      _this.Socket.send(JSON.stringify({ type: 'meta', interfaceName: interfaceName, key: 'register' }));
    };

    this.initialized = true;
  },
  getServerAddress: function getServerAddress() {
    var expr = void 0,
        socketIPAndPort = void 0,
        socketString = void 0,
        ip = void 0,
        port = void 0;

    expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/;

    socketIPAndPort = expr.exec(window.location.toString())[0].split(':');
    ip = socketIPAndPort[0];
    port = parseInt(socketIPAndPort[1]);

    socketString = 'ws://' + ip + ':' + port;

    return socketString;
  },
  onmessage: function onmessage(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'osc') {
      Communication.OSC._receive(e.data);
    } else {
      if (Communication.Socket.receive) {
        Communication.Socket.receive(data.address, data.parameters);
      }
    }
  },


  OSC: {
    callbacks: {},
    onmessage: null,

    send: function send(address, parameters) {
      if (Communication.Socket.readyState === 1) {
        if (typeof address === 'string') {
          var msg = {
            type: "osc",
            address: address,
            'parameters': Array.isArray(parameters) ? parameters : [parameters]
          };

          Communication.Socket.send(JSON.stringify(msg));
        } else {
          throw Error('Invalid osc message:', arguments);
        }
      } else {
        throw Error('Socket is not yet connected; cannot send OSC messsages.');
      }
    },
    receive: function receive(data) {
      var msg = JSON.parse(data);

      if (msg.address in this.callbacks) {
        this.callbacks[msg.address](msg.parameters);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _widget2.default.widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var widget = _step.value;

            //console.log( "CHECK", child.key, msg.address )
            if (widget.key === msg.address) {
              //console.log( child.key, msg.parameters )
              widget.setValue.apply(widget, msg.parameters);
              return;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (this.onmessage !== null) {
          this.receive(msg.address, msg.typetags, msg.parameters);
        }
      }
    }
  }

};

exports.default = Communication;

},{"./widget":16}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

var DOMWidget = Object.create(_widget2.default);

Object.assign(DOMWidget, {
  /** @lends DOMWidget.prototype */

  /**
   * A set of default property settings for all DOMWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false
  },

  /**
   * Create a new DOMWidget instance
   * @memberof DOMWidget
   * @constructs
   * @static
   */
  create: function create() {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _widget2.default.create.call(this);

    Object.assign(this, DOMWidget.defaults);

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if (typeof this.createElement === 'function') {

      /**
       * The DOM element used by the DOMWidget
       * @memberof DOMWidget
       * @instance
       */
      this.element = this.createElement();
    } else {
      throw new Error('widget inheriting from DOMWidget does not implement createElement method; this is required.');
    }
  },


  /**
   * Create a DOM element to be placed in a Panel.
   * @virtual
   * @memberof DOMWidget
   * @static
   */
  createElement: function createElement() {
    throw Error('all subclasses of DOMWidget must implement createElement()');
  },


  /**
   * use CSS to position element element of widget
   * @memberof DOMWidget
   */
  place: function place() {
    var containerWidth = this.container.getWidth(),
        containerHeight = this.container.getHeight(),
        width = this.width <= 1 ? containerWidth * this.width : this.width,
        height = this.height <= 1 ? containerHeight * this.height : this.height,
        x = this.x < 1 ? containerWidth * this.x : this.x,
        y = this.y < 1 ? containerHeight * this.y : this.y;

    if (!this.attached) {
      this.attached = true;
    }

    if (this.isSquare) {
      if (height > width) {
        height = width;
      } else {
        width = height;
      }
    }

    this.element.width = width;
    this.element.style.width = width + 'px';
    this.element.height = height;
    this.element.style.height = height + 'px';
    this.element.style.left = x;
    this.element.style.top = y;

    /**
     * Bounding box, in absolute coordinates, of the DOMWidget
     * @memberof DOMWidget
     * @instance
     * @type {Object}
     */
    this.rect = this.element.getBoundingClientRect();

    if (typeof this.onplace === 'function') this.onplace();
  }
});

exports.default = DOMWidget;

},{"./utilities":15,"./widget":16}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Filters = {
  Scale: function Scale() {
    var inmin = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var inmax = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var outmin = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
    var outmax = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

    var inrange = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange;

    return function (input) {
      return outmin + input * rangeRatio;
    };
  }
};

exports.default = Filters;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XY = exports.Keyboard = exports.MultiButton = exports.MultiSlider = exports.Knob = exports.Communication = exports.Menu = exports.Button = exports.Joystick = exports.Slider = exports.Panel = undefined;

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

var _joystick = require('./joystick');

var _joystick2 = _interopRequireDefault(_joystick);

var _button = require('./button');

var _button2 = _interopRequireDefault(_button);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

var _communication = require('./communication');

var _communication2 = _interopRequireDefault(_communication);

var _pepjs = require('pepjs');

var _pepjs2 = _interopRequireDefault(_pepjs);

var _knob = require('./knob');

var _knob2 = _interopRequireDefault(_knob);

var _multislider = require('./multislider');

var _multislider2 = _interopRequireDefault(_multislider);

var _multiButton = require('./multiButton');

var _multiButton2 = _interopRequireDefault(_multiButton);

var _keyboard = require('./keyboard');

var _keyboard2 = _interopRequireDefault(_keyboard);

var _xy = require('./xy');

var _xy2 = _interopRequireDefault(_xy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Everything we need to include goes here and is fed to browserify in the gulpfile.js

exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Joystick = _joystick2.default;
exports.Button = _button2.default;
exports.Menu = _menu2.default;
exports.Communication = _communication2.default;
exports.Knob = _knob2.default;
exports.MultiSlider = _multislider2.default;
exports.MultiButton = _multiButton2.default;
exports.Keyboard = _keyboard2.default;
exports.XY = _xy2.default;

},{"./button":1,"./communication":3,"./joystick":7,"./keyboard":8,"./knob":9,"./menu":10,"./multiButton":11,"./multislider":12,"./panel":13,"./slider":14,"./xy":18,"pepjs":19}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A joystick that can be used to select an XY position and then snaps back. 
 * @module Joystick
 * @augments CanvasWidget
 */

var Joystick = Object.create(_canvasWidget2.default);

Object.assign(Joystick, {
  /** @lends Joystick.prototype */

  /**
   * A set of default property settings for all Joystick instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Joystick
   * @static
   */
  defaults: {
    __value: [.5, .5], // always 0-1, not for end-users
    value: [.5, .5], // end-user value that may be filtered
    active: false
  },

  /**
   * Create a new Joystick instance.
   * @memberof Joystick
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var joystick = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(joystick);

    // ...and then finally override with user defaults
    Object.assign(joystick, Joystick.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) joystick.__value = props.value;

    // inherits from Widget
    joystick.init();

    return joystick;
  },


  /**
   * Draw the Joystick onto its canvas context using the current .__value property.
   * @memberof Joystick
   * @instance
   */
  perp_norm_vector: function perp_norm_vector(value) {
    var x1 = value[0] - .5;
    var y1 = value[1] - .5;
    var x2 = 0.0;
    var y2 = -(x1 / y1) * (x2 - x1) + y1;
    var x3 = x2 - x1;
    var y3 = y2 - y1;
    var m = Math.sqrt(x3 * x3 + y3 * y3);
    x3 = x3 / m;
    y3 = y3 / m;

    return [x3, y3];
  },
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;
    var v = this.perp_norm_vector(this.__value);
    var r = 15.0;

    this.ctx.beginPath();
    this.ctx.moveTo(this.rect.width * 0.5 + r * v[0] * .25, this.rect.height * .5 + r * v[1] * .25);
    this.ctx.lineTo(this.rect.width * this.__value[0] + r * v[0], this.rect.height * this.__value[1] + r * v[1]);
    this.ctx.lineTo(this.rect.width * this.__value[0] - r * v[0], this.rect.height * this.__value[1] - r * v[1]);
    this.ctx.lineTo(this.rect.width * 0.5 - r * v[0] * .25, this.rect.height * .5 - r * v[1] * .25);
    this.ctx.fill();
    //  this.ctx.fillRect( this.rect.width * this.__value[0] -12, this.rect.height * this.__value[1] -12, 24, 24 )
    this.ctx.beginPath();
    this.ctx.arc(this.rect.width * this.__value[0], this.rect.height * this.__value[1], r, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(this.rect.width * 0.5, this.rect.height * 0.5, r * .25, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
        this.__value = [.5, .5];
        this.output();
        this.draw();
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Joystick's position, and triggers output.
   * @instance
   * @memberof Joystick
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {

    this.__value[0] = (e.clientX - this.rect.left) / this.rect.width;
    this.__value[1] = (e.clientY - this.rect.top) / this.rect.height;

    // clamp __value, which is only used internally
    if (this.__value[0] > 1) this.__value[0] = 1;
    if (this.__value[1] > 1) this.__value[1] = 1;
    if (this.__value[0] < 0) this.__value[0] = 0;
    if (this.__value[1] < 0) this.__value[1] = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

exports.default = Joystick;

},{"./canvasWidget.js":2}],8:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

var _utilities = require('./utilities.js');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Keys
 * @augments CanvasWidget
 */

var Keys = Object.create(_canvasWidget2.default);

var keyTypesForNote = {
  c: 'wRight',
  'c#': 'b',
  db: 'b',
  d: 'wMiddle',
  'd#': 'b',
  eb: 'b',
  e: 'wLeft',
  f: 'wRight',
  'f#': 'b',
  gb: 'b',
  g: 'wMiddleR',
  'g#': 'b',
  ab: 'b',
  a: 'wMiddleL',
  'a#': 'b',
  bb: 'b',
  b: 'wLeft'
};

var noteIntegers = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

var keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

Object.assign(Keys, {
  /** @lends Keys.prototype */

  /**
   * A set of default property settings for all Keys instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Keys
   * @static
   */
  defaults: {
    active: false,
    startKey: 36,
    endKey: 60,
    whiteColor: '#fff',
    blackColor: '#000'
  },

  /**
   * Create a new Keys instance.
   * @memberof Keys
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Keys with.
   * @static
   */
  create: function create(props) {
    var keys = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Keys defaults
    _canvasWidget2.default.create.call(keys);

    // ...and then finally override with user defaults
    Object.assign(keys, Keys.defaults, props, {
      value: {},
      __value: {},
      bounds: [],
      active: {},
      __prevValue: []
    });

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) keys.__value = props.value;

    // inherits from Widget
    keys.init();

    for (var i = keys.startKey; i < keys.endKey; i++) {
      keys.__value[i] = 0;
      keys.value[i] = 0;
      keys.bounds[i] = [];
    }

    keys.onplace = function () {
      return keys.__defineBounds();
    };

    return keys;
  },
  __defineBounds: function __defineBounds() {
    var keyRange = this.endKey - this.startKey;
    var rect = this.rect;
    var keyWidth = rect.width / keyRange * 1.725;
    var blackHeight = .65 * rect.height;

    var currentX = 0;

    for (var i = 0; i < keyRange; i++) {
      var bounds = this.bounds[this.startKey + i];
      var noteNumber = (this.startKey + i) % 12;
      var noteName = noteIntegers[noteNumber];
      var noteDrawType = keyTypesForNote[noteName];

      switch (noteDrawType) {
        case 'wRight':
          bounds.push({ x: currentX, y: 0 });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: 0 });
          bounds.push({ x: currentX, y: 0 });

          currentX += keyWidth * .6;
          break;

        case 'b':
          bounds.push({ x: currentX, y: 0 });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: 0 });
          bounds.push({ x: currentX, y: 0 });

          currentX += keyWidth * .4;
          break;

        case 'wMiddle':
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth * .8;
          break;

        case 'wLeft':
          currentX -= keyWidth * .2;

          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: 0 });
          bounds.push({ x: currentX + keyWidth * .4, y: 0 });
          bounds.push({ x: currentX + keyWidth * .4, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth;
          break;

        case 'wMiddleR':
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1.1, y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1.1, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });

          currentX += keyWidth * .7;
          break;

        case 'wMiddleL':
          currentX -= keyWidth * .1;

          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: 0 });
          bounds.push({ x: currentX + keyWidth * .3, y: 0 });
          bounds.push({ x: currentX + keyWidth * .3, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth * .8;
          break;
        default:
      }
    }
  },


  /**
   * Draw the Keys onto its canvas context using the current .__value property.
   * @memberof Keys
   * @instance
   */
  draw: function draw() {
    var ctx = this.ctx;
    ctx.strokeStyle = this.blackColor;
    ctx.lineWidth = 1;

    var count = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.bounds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var bounds = _step.value;

        if (bounds === undefined) continue;

        var noteNumber = (this.startKey + count) % 12;
        var noteName = noteIntegers[noteNumber];
        var noteDrawType = keyTypesForNote[noteName];

        ctx.beginPath();

        ctx.moveTo(bounds[0].x, bounds[0].y);

        for (var idx = 1; idx < bounds.length; idx++) {
          ctx.lineTo(bounds[idx].x, bounds[idx].y);
        }

        ctx.closePath();

        if (this.__value[this.startKey + count] === 1) {
          ctx.fillStyle = '#999';
        } else {
          ctx.fillStyle = keyColors[noteNumber] === 1 ? this.whiteColor : this.blackColor;
        }

        ctx.fill();
        ctx.stroke();

        count++;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
  },


  events: {
    pointerdown: function pointerdown(e) {
      var hit = this.processPointerPosition(e, 'down'); // change keys value on click / touchdown
      if (hit !== null) {
        this.active[e.pointerId] = hit;
        //this.active[ e.pointerId ].lastButton = data.buttonNum
      }

      //window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },
    pointerup: function pointerup(e) {
      var keyNum = this.active[e.pointerId];

      if (keyNum !== undefined) {
        delete this.active[e.pointerId];

        this.__value[keyNum] = 0;
        var shouldDraw = this.output(keyNum);
        if (shouldDraw) this.draw();

        //window.removeEventListener( 'pointermove', this.pointermove ) 
        //window.removeEventListener( 'pointerup',   this.pointerup ) 
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        //this.processPointerPosition( e )
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Keys's position, and triggers output.
   * @instance
   * @memberof Keys
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e, dir) {
    var prevValue = this.value,
        hitKeyNum = null,
        shouldDraw = false;

    for (var i = this.startKey; i < this.endKey; i++) {
      var hit = _utilities2.default.polyHitTest(e, this.bounds[i], this.rect);

      if (hit === true) {
        hitKeyNum = i;
        this.__value[i] = dir === 'down' ? 1 : 0;
        var __shouldDraw = this.output(hitKeyNum, dir);

        if (__shouldDraw === true) shouldDraw = true;
      }
    }

    if (shouldDraw) this.draw();

    return hitKeyNum;
  },
  output: function output(keyNum, dir) {
    var value = this.__value[keyNum],
        newValueGenerated = false,
        prevValue = this.__prevValue[keyNum];

    value = this.runFilters(value, this);

    this.value[keyNum] = value;

    if (this.target !== null) this.transmit([value, keyNum]);

    if (prevValue !== undefined) {
      if (value !== prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(value, keyNum);

      this.__prevValue[keyNum] = value;
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  }
});

module.exports = Keys;

},{"./canvasWidget.js":2,"./utilities.js":15}],9:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Knob
 * @augments CanvasWidget
 */

var Knob = Object.create(_canvasWidget2.default);

Object.assign(Knob, {
  /** @lends Knob.prototype */

  /**
   * A set of default property settings for all Knob instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Knob
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    knobBuffer: 20,
    usesRotation: false,
    lastPosition: 0,
    isSquare: true,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Knob instance.
     * @memberof Knob
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Knob instance.
   * @memberof Knob
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Knob with.
   * @static
   */
  create: function create(props) {
    var knob = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Knob defaults
    _canvasWidget2.default.create.call(knob);

    // ...and then finally override with user defaults
    Object.assign(knob, Knob.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) knob.__value = props.value;

    // inherits from Widget
    knob.init();

    return knob;
  },


  /**
   * Draw the Knob onto its canvas context using the current .__value property.
   * @memberof Knob
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.container.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    var x = 0,
        y = 0,
        width = this.rect.width,
        height = this.rect.height,
        radius = width / 2;

    this.ctx.fillRect(x, y, width, height);
    //this.ctx.strokeStyle = this.stroke

    this.ctx.fillStyle = this.background; // draw background of widget first

    var angle0 = Math.PI * .6,
        angle1 = Math.PI * .4;

    this.ctx.beginPath();
    this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle1, false);
    this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle1, angle0, true);
    this.ctx.closePath();

    this.ctx.fill();

    var angle2 = void 0;
    if (!this.isInverted) {
      angle2 = Math.PI * .6 + this.__value * 1.8 * Math.PI;
      if (angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI;
    } else {
      angle2 = Math.PI * (0.4 - 1.8 * this.__value);
    }

    this.ctx.beginPath();

    if (!this.isInverted) {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle2, false);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle0, true);
    } else {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle1, angle2, true);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle1, false);
    }

    this.ctx.closePath();

    this.ctx.fillStyle = this.fill;
    this.ctx.fill();
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change knob value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Knob's position, and triggers output.
   * @instance
   * @memberof Knob
   * @param {PointerEvent} e - The pointer event to be processed.
   */

  processPointerPosition: function processPointerPosition(e) {
    var xOffset = e.clientX,
        yOffset = e.clientY;

    var radius = this.rect.width / 2;
    this.lastValue = this.value;

    if (!this.usesRotation) {
      if (this.lastPosition !== -1) {
        //this.__value -= ( yOffset - this.lastPosition ) / (radius * 2);
        this.__value = 1 - yOffset / this.rect.height;
      }
    } else {
      var xdiff = radius - xOffset;
      var ydiff = radius - yOffset;
      var angle = Math.PI + Math.atan2(ydiff, xdiff);
      this.__value = (angle + Math.PI * 1.5) % (Math.PI * 2) / (Math.PI * 2);

      if (this.lastRotationValue > .8 && this.__value < .2) {
        this.__value = 1;
      } else if (this.lastRotationValue < .2 && this.__value > .8) {
        this.__value = 0;
      }
    }

    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    this.lastRotationValue = this.__value;
    this.lastPosition = yOffset;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = Knob;

},{"./canvasWidget.js":2}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget.js');

var _domWidget2 = _interopRequireDefault(_domWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */
var Menu = Object.create(_domWidget2.default);

Object.assign(Menu, {
  /** @lends Menu.prototype */

  /**
   * A set of default property settings for all Menu instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Menu
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    background: '#333',
    fill: '#777',
    stroke: '#aaa',
    borderWidth: 4,

    /**
     * The options array stores the different possible values for the Menu
     * widget. There are used to create HTML option elements which are then
     * attached to the primary select element used by the Menu.
     * @memberof Menu
     * @instance
     * @type {Array}
     */
    options: [],
    onvaluechange: null
  },

  /**
   * Create a new Menu instance.
   * @memberof Menu
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Menu with.
   * @static
   */
  create: function create(props) {
    var menu = Object.create(this);

    _domWidget2.default.create.call(menu);

    Object.assign(menu, Menu.defaults, props);

    menu.createOptions();

    menu.element.addEventListener('change', function (e) {
      menu.__value = e.target.value;
      menu.output();

      if (menu.onvaluechange !== null) {
        menu.onvaluechange(menu.value);
      }
    });

    return menu;
  },


  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Menu 
   * @instance
   */
  createElement: function createElement() {
    var select = document.createElement('select');

    return select;
  },


  /**
   * Generate option elements for menu. Removes previously appended elements.
   * @memberof Menu 
   * @instance
   */
  createOptions: function createOptions() {
    this.element.innerHTML = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var option = _step.value;

        var optionEl = document.createElement('option');
        optionEl.setAttribute('value', option);
        optionEl.innerText = option;
        this.element.appendChild(optionEl);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },


  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Menu 
   * @instance
   */
  __addToPanel: function __addToPanel(panel) {
    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();
  }
});

exports.default = Menu;

},{"./domWidget.js":4}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A MultiButton with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the multiButtons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module MultiButton
 * @augments CanvasWidget
 */

var MultiButton = Object.create(_canvasWidget2.default);

Object.assign(MultiButton, {

  /** @lends MultiButton.prototype */

  /**
   * A set of default property settings for all MultiButton instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiButton
   * @static
   */
  defaults: {
    rows: 2,
    columns: 2,
    lastButton: null,
    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the MultiButton instance.
     * @memberof MultiButton
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new MultiButton instance.
   * @memberof MultiButton
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a MultiButton instance with.
   * @static
   */
  create: function create(props) {
    var multiButton = Object.create(this);

    _canvasWidget2.default.create.call(multiButton);

    Object.assign(multiButton, MultiButton.defaults, props);

    if (props.value) {
      multiButton.__value = props.value;
    } else {
      multiButton.__value = [];
      for (var i = 0; i < multiButton.count; i++) {
        multiButton.__value[i] = 0;
      }multiButton.value = [];
    }

    multiButton.active = {};
    multiButton.__prevValue = [];

    multiButton.init();

    return multiButton;
  },


  /**
   * Draw the MultiButton into its canvas context using the current .__value property and multiButton style.
   * @memberof MultiButton
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    var buttonWidth = this.rect.width / this.columns,
        buttonHeight = this.rect.height / this.rows;

    for (var row = 0; row < this.rows; row++) {
      var y = row * buttonHeight;
      for (var column = 0; column < this.columns; column++) {
        var x = column * buttonWidth,
            _buttonNum = row * this.columns + column;

        this.ctx.fillStyle = this.__value[_buttonNum] === 1 ? this.fill : this.background;
        this.ctx.fillRect(x, y, buttonWidth, buttonHeight);
        this.ctx.strokeRect(x, y, buttonWidth, buttonHeight);
      }
    }
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },
  getDataFromEvent: function getDataFromEvent(e) {
    var rowSize = 1 / this.rows,
        row = Math.floor(e.clientY / this.rect.height / rowSize),
        columnSize = 1 / this.columns,
        column = Math.floor(e.clientX / this.rect.width / columnSize),
        buttonNum = row * this.columns + column;

    return { buttonNum: buttonNum, row: row, column: column };
  },
  processButtonOn: function processButtonOn(data, e) {
    var _this = this;

    if (this.style === 'toggle') {
      this.__value[buttonNum] = this.__value[buttonNum] === 1 ? 0 : 1;
    } else if (this.style === 'momentary') {
      this.__value[buttonNum] = 1;
      setTimeout(function () {
        _this.__value[buttonNum] = 0;
        //let idx = this.active.findIndex( v => v.buttonNum === buttonNum )
        //this.active.splice( idx, 1 )
        _this.active[e.pointerId].splice(_this.active[e.pointerId].indexOf(buttonNum), 1);
        _this.draw();
      }, 50);
    } else if (this.style === 'hold') {
      this.__value[data.buttonNum] = 1;
    }

    this.output(data);

    this.draw();
  },


  events: {
    pointerdown: function pointerdown(e) {
      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      var data = this.getDataFromEvent(e);

      this.active[e.pointerId] = [data.buttonNum];
      this.active[e.pointerId].lastButton = data.buttonNum;

      window.addEventListener('pointermove', this.pointermove);
      window.addEventListener('pointerup', this.pointerup);

      this.processButtonOn(data, e);
    },
    pointermove: function pointermove(e) {
      var data = this.getDataFromEvent(e);

      var checkForPressed = this.active[e.pointerId].indexOf(data.buttonNum),
          lastButton = this.active[e.pointerId].lastButton;

      if (checkForPressed === -1 && lastButton !== data.buttonNum) {

        if (this.style === 'toggle' || this.style === 'hold') {
          if (this.style === 'hold') {
            this.__value[lastButton] = 0;
            this.output(data);
          }
          this.active[e.pointerId] = [data.buttonNum];
        } else {
          this.active[e.pointerId].push(data.buttonNum);
        }

        this.active[e.pointerId].lastButton = data.buttonNum;

        this.processButtonOn(data, e);
      }
    },
    pointerup: function pointerup(e) {
      if (Object.keys(this.active).length) {
        window.removeEventListener('pointerup', this.pointerup);
        window.removeEventListener('pointermove', this.pointermove);

        if (this.style !== 'toggle') {
          var buttonsForPointer = this.active[e.pointerId];

          if (buttonsForPointer !== undefined) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = buttonsForPointer[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var button = _step.value;

                this.__value[button] = 0;
                var row = Math.floor(button / this.rows),
                    column = button % this.columns;

                this.output({ buttonNum: button, row: row, column: column });
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            delete this.active[e.pointerId];

            this.draw();
          }
        }
      }
    }
  },

  output: function output(buttonData) {
    var value = this.__value[buttonData.buttonNum],
        newValueGenerated = false,
        prevValue = this.__prevValue[buttonData.buttonNum];

    value = this.runFilters(value, this);

    this.value[buttonData.buttonNum] = value;

    if (this.target !== null) this.transmit([value, buttonData.row, buttonData.column]);

    if (prevValue !== undefined) {
      if (value !== prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(value, buttonData.row, buttonData.column);

      this.__prevValue[buttonData.buttonNum] = value;
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  }
});

exports.default = MultiButton;

},{"./canvasWidget":2}],12:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module MultiSlider
 * @augments CanvasWidget
 */

var MultiSlider = Object.create(_canvasWidget2.default);

Object.assign(MultiSlider, {
  /** @lends MultiSlider.prototype */

  /**
   * A set of default property settings for all MultiSlider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiSlider
   * @static
   */
  defaults: {
    __value: [.15, .35, .5, .75], // always 0-1, not for end-users
    value: [.5, .5, .5, .5], // end-user value that may be filtered
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof MultiSlider
     * @instance
     * @type {Integer}
     */
    count: 4,
    lineWidth: 1,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the MultiSlider instance.
     * @memberof MultiSlider
     * @instance
     * @type {String}
     */
    style: 'vertical'
  },

  /**
   * Create a new MultiSlider instance.
   * @memberof MultiSlider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize MultiSlider with.
   * @static
   */
  create: function create(props) {
    var multiSlider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with MultiSlider defaults
    _canvasWidget2.default.create.call(multiSlider);

    // ...and then finally override with user defaults
    Object.assign(multiSlider, MultiSlider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) multiSlider.__value = props.value;

    // inherits from Widget
    multiSlider.init();

    if (props.value === undefined && multiSlider.count !== 4) {
      for (var i = 0; i < multiSlider.count; i++) {
        multiSlider.__value[i] = i / multiSlider.count;
      }
    } else if (typeof props.value === 'number') {
      for (var _i = 0; _i < multiSlider.count; _i++) {
        multiSlider.__value[_i] = props.value;
      }
    }

    return multiSlider;
  },


  /**
   * Draw the MultiSlider onto its canvas context using the current .__value property.
   * @memberof MultiSlider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (multiSlider value representation)
    this.ctx.fillStyle = this.fill;

    var sliderWidth = this.style === 'vertical' ? this.rect.width / this.count : this.rect.height / this.count;

    for (var i = 0; i < this.count; i++) {

      if (this.style === 'horizontal') {
        var ypos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(0, ypos, this.rect.width * this.__value[i], Math.ceil(sliderWidth));
        this.ctx.strokeRect(0, ypos, this.rect.width, sliderWidth);
      } else {
        var xpos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(xpos, this.rect.height - this.__value[i] * this.rect.height, Math.ceil(sliderWidth), this.rect.height * this.__value[i]);
        this.ctx.strokeRect(xpos, 0, sliderWidth, this.rect.height);
      }
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change multiSlider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the MultiSlider's position, and triggers output.
   * @instance
   * @memberof MultiSlider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value,
        sliderNum = void 0;

    if (this.style === 'horizontal') {
      sliderNum = Math.floor(e.clientY / this.rect.height / (1 / this.count));
      this.__value[sliderNum] = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      sliderNum = Math.floor(e.clientX / this.rect.width / (1 / this.count));
      this.__value[sliderNum] = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    for (var i = 0; i < this.count; i++) {
      if (this.__value[i] > 1) this.__value[i] = 1;
      if (this.__value[i] < 0) this.__value[i] = 0;
    }

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = MultiSlider;

},{"./canvasWidget.js":2}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Panel = {
  defaults: {
    fullscreen: false,
    background: '#333'
  },

  // class variable for reference to all panels
  panels: [],

  create: function create() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var panel = Object.create(this);

    // default: full window interface
    if (props === null) {

      Object.assign(panel, Panel.defaults, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        __x: 0,
        __y: 0,
        __width: null,
        __height: null,
        fullscreen: true,
        children: []
      });

      panel.div = panel.__createHTMLElement();
      panel.layout();

      var body = document.querySelector('body');
      body.appendChild(panel.div);
    }

    Panel.panels.push(panel);

    return panel;
  },
  __createHTMLElement: function __createHTMLElement() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.display = 'block';
    div.style.backgroundColor = this.background;

    return div;
  },
  layout: function layout() {
    if (this.fullscreen) {
      this.__width = window.innerWidth;
      this.__height = window.innerHeight;
      this.__x = this.x * this.__width;
      this.__y = this.y * this.__height;

      this.div.style.width = this.__width + 'px';
      this.div.style.height = this.__height + 'px';
      this.div.style.left = this.__x + 'px';
      this.div.style.top = this.__y + 'px';
    }
  },
  getWidth: function getWidth() {
    return this.__width;
  },
  getHeight: function getHeight() {
    return this.__height;
  },
  add: function add() {
    for (var _len = arguments.length, widgets = Array(_len), _key = 0; _key < _len; _key++) {
      widgets[_key] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var widget = _step.value;


        // check to make sure widget has not been already added
        if (this.children.indexOf(widget) === -1) {
          if (typeof widget.__addToPanel === 'function') {
            this.div.appendChild(widget.element);
            this.children.push(widget);

            widget.__addToPanel(this);
          } else {
            throw Error('Widget cannot be added to panel; it does not contain the method .__addToPanel');
          }
        } else {
          throw Error('Widget is already added to panel.');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
};

exports.default = Panel;

},{}],14:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Slider
 * @augments CanvasWidget
 */

var Slider = Object.create(_canvasWidget2.default);

Object.assign(Slider, {
  /** @lends Slider.prototype */

  /**
   * A set of default property settings for all Slider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Slider
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Slider instance.
     * @memberof Slider
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Slider instance.
   * @memberof Slider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var slider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(slider);

    // ...and then finally override with user defaults
    Object.assign(slider, Slider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) slider.__value = props.value;

    // inherits from Widget
    slider.init();

    return slider;
  },


  /**
   * Draw the Slider onto its canvas context using the current .__value property.
   * @memberof Slider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.rect.width * this.__value, this.rect.height);else this.ctx.fillRect(0, this.rect.height - this.__value * this.rect.height, this.rect.width, this.rect.height * this.__value);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Slider's position, and triggers output.
   * @instance
   * @memberof Slider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value;

    if (this.style === 'horizontal') {
      this.__value = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      this.__value = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    // clamp __value, which is only used internally
    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = Slider;

},{"./canvasWidget.js":2}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  },
  compareArrays: function compareArrays(a1, a2) {
    return a1.length === a2.length && a1.every(function (v, i) {
      return v === a2[i];
    });
  },


  // ported/adapted from orignal Interface.js ButtonV code by Jonathan Simozar
  polyHitTest: function polyHitTest(e, bounds, rect) {
    var w = rect.width,
        h = rect.height,
        p = bounds;

    var sides = 0,
        hit = false;

    for (var i = 0; i < p.length - 1; i++) {
      if (p[i + 1].x > p[i].x) {
        if (p[i].x <= e.x && e.x < p[i + 1].x) {
          var yval = (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x) * h / w * (e.x - p[i].x) + p[i].y;

          if (yval - e.y < 0) sides++;
        }
      } else if (p[i + 1].x < p[i].x) {
        if (p[i].x >= e.x && e.x > p[i + 1].x) {
          var _yval = (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x) * h / w * (e.x - p[i].x) + p[i].y;

          if (_yval - e.y < 0) sides++;
        }
      }
    }

    if (sides % 2 === 1) hit = true;

    return hit;
  }
};

exports.default = Utilities;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _communication = require('./communication.js');

var _communication2 = _interopRequireDefault(_communication);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Widget is the base class that all other UI elements inherits from. It primarily
 * includes methods for filtering / scaling output.
 * @module Widget
 */

var Widget = {
  /** @lends Widget.prototype */

  /**
   * store all instantiated widgets.
   * @type {Array.<Widget>}
   * @static
   */
  widgets: [],
  lastValue: null,
  onvaluechange: null,

  /**
   * A set of default property settings for all widgets
   * @type {Object}
   * @static
   */
  defaults: {
    min: 0, max: 1,
    scaleOutput: true, // apply scale filter by default for min / max ranges
    target: null,
    __prevValue: null
  },

  /**
   * Create a new Widget instance
   * @memberof Widget
   * @constructs
   * @static
   */
  create: function create() {
    Object.assign(this, Widget.defaults);

    /** 
     * Stores filters for transforming widget output.
     * @memberof Widget
     * @instance
     */
    this.filters = [];

    this.__prefilters = [];
    this.__postfilters = [];

    Widget.widgets.push(this);

    return this;
  },


  /**
   * Initialization method for widgets. Checks to see if widget contains
   * a 'target' property; if so, makes sure that communication with that
   * target is initialized.
   * @memberof Widget
   * @instance
   */

  init: function init() {
    if (this.target && this.target === 'osc' || this.target === 'midi') {
      if (!_communication2.default.initialized) _communication2.default.init();
    }

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.__prefilters.push(_filters2.default.Scale(0, 1, this.min, this.max));
    }
  },
  runFilters: function runFilters(value, widget) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widget.__prefilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var filter = _step.value;
        value = filter(value);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = widget.filters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _filter = _step2.value;
        value = _filter(value);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = widget.__postfilters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _filter2 = _step3.value;
        value = _filter2(value);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return value;
  },


  /**
   * Calculates output of widget by running .__value property through filter chain.
   * The result is stored in the .value property of the widget, which is then
   * returned.
   * @memberof Widget
   * @instance
   */
  output: function output() {
    var _this = this;

    var value = this.__value,
        newValueGenerated = false,
        lastValue = this.value,
        isArray = void 0;

    isArray = Array.isArray(value);

    if (isArray) {
      value = value.map(function (v) {
        return Widget.runFilters(v, _this);
      });
    } else {
      value = this.runFilters(value, this);
    }

    this.value = value;

    if (this.target !== null) this.transmit(this.value);

    if (this.__prevValue !== null) {
      if (isArray) {
        if (!_utilities2.default.compareArrays(this.__value, this.__prevValue)) {
          newValueGenerated = true;
        }
      } else if (this.__value !== this.__prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(this.value, lastValue);

      if (Array.isArray(this.__value)) {
        this.__prevValue = this.__value.slice();
      } else {
        this.__prevValue = this.__value;
      }
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  },


  /**
   * If the widget has a remote target (not a target inside the interface web page)
   * this will transmit the widgets value to the remote destination.
   * @memberof Widget
   * @instance
   */
  transmit: function transmit(output) {
    if (this.target === 'osc') {
      _communication2.default.OSC.send(this.address, output);
    } else {
      if (this.target[this.key] !== undefined) {
        if (typeof this.target[this.key] === 'function') {
          this.target[this.key](output);
        } else {
          this.target[this.key] = output;
        }
      }
    }
  }
};

exports.default = Widget;

},{"./communication.js":3,"./filters":5,"./utilities":15}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var WidgetLabel = {

  defaults: {
    size: 24,
    face: 'sans-serif',
    fill: 'white',
    align: 'center',
    background: null,
    width: 1
  },

  create: function create(props) {
    var label = Object.create(this);

    Object.assign(label, this.defaults, props);

    if (_typeof(label.ctx) === undefined) throw Error('WidgetLabels must be constructed with a canvas context (ctx) argument');

    label.font = label.size + 'px ' + label.face;

    return label;
  },
  draw: function draw() {
    var cnvs = this.ctx.canvas,
        cwidth = cnvs.width,
        cheight = cnvs.height,
        x = this.x * cwidth,
        y = this.y * cheight,
        width = this.width * cwidth;

    if (this.background !== null) {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(x, y, width, this.size + 10);
    }

    this.ctx.fillStyle = this.fill;
    this.ctx.textAlign = this.align;
    this.ctx.font = this.font;
    this.ctx.fillText(this.text, x, y, width);
  }
};

exports.default = WidgetLabel;

},{}],18:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

var _victor = require('victor');

var _victor2 = _interopRequireDefault(_victor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module XY
 * @augments CanvasWidget
 */

var XY = Object.create(_canvasWidget2.default);

Object.assign(XY, {
  /** @lends XY.prototype */

  /**
   * A set of default property settings for all XY instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof XY
   * @static
   */
  defaults: {
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof XY
     * @instance
     * @type {Integer}
     */
    count: 4,
    lineWidth: 1,
    usePhysics: true,
    touchSize: 50,
    fill: 'rgba( 255,255,255, .2 )',
    stroke: '#999',
    background: '#000',
    friction: .0
  },

  /**
   * Create a new XY instance.
   * @memberof XY
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize XY with.
   * @static
   */
  create: function create(props) {
    var xy = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with XY defaults
    _canvasWidget2.default.create.call(xy);

    // ...and then finally override with user defaults
    Object.assign(xy, XY.defaults, props, {
      value: [],
      __value: [],
      touches: []
    });

    // set underlying value if necessary... TODO: how should this be set given min/max?
    // if( props.value ) xy.__value = props.value

    // inherits from Widget
    xy.init();

    xy.onplace = function () {
      for (var i = 0; i < xy.count; i++) {
        xy.touches.push({
          pos: new _victor2.default(i * (xy.rect.width / xy.count), i * (xy.rect.height / xy.count)),
          vel: new _victor2.default(0, 0),
          acc: new _victor2.default(.05, .05),
          name: xy.names === undefined ? i : xy.names[i]
        });
      }

      xy.startAnimationLoop();
    };

    return xy;
  },
  startAnimationLoop: function startAnimationLoop() {
    var _this = this;

    this.draw(true);

    var loop = function loop() {
      _this.draw();
      window.requestAnimationFrame(loop);
    };

    loop();
  },
  animate: function animate() {
    var shouldDraw = true;
    var __friction = new _victor2.default(-1 * this.friction, -1 * this.friction);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.touches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var touch = _step.value;

        if (touch.vel.x !== 0 && touch.vel.y !== 0) {
          //touch.vel.add( touch.acc )
          var friction = touch.vel.clone();
          friction.x *= -1 * this.friction;
          friction.y *= -1 * this.friction;
          touch.vel.add(friction);

          if (touch.pos.x - this.touchSize + touch.vel.x < 0) {
            touch.pos.x = this.touchSize;
            touch.vel.x *= -1;
          } else if (touch.pos.x + this.touchSize + touch.vel.x > this.rect.width) {
            touch.pos.x = this.rect.width - this.touchSize;
            touch.vel.x *= -1;
          } else {
            touch.pos.x += touch.vel.x;
          }

          if (touch.pos.y - this.touchSize + touch.vel.y < 0) {
            touch.pos.y = this.touchSize;
            touch.vel.y *= -1;
          } else if (touch.pos.y + this.touchSize + touch.vel.y > this.rect.height) {
            touch.pos.y = this.rect.height - this.touchSize;
            touch.vel.y *= -1;
          } else {
            touch.pos.y += touch.vel.y;
          }

          shouldDraw = true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return shouldDraw;
  },


  /**
   * Draw the XY onto its canvas context using the current .__value property.
   * @memberof XY
   * @instance
   */
  draw: function draw() {
    var override = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var shouldDraw = this.animate();

    if (shouldDraw === false && override === false) return;

    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (xy value representation)
    this.ctx.fillStyle = this.fill;

    for (var i = 0; i < this.count; i++) {
      var child = this.touches[i];
      this.ctx.fillStyle = this.fill;

      this.ctx.beginPath();

      this.ctx.arc(child.pos.x, child.pos.y, this.touchSize, 0, Math.PI * 2, true);

      this.ctx.closePath();

      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillRect(this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = this.stroke;
      this.ctx.font = 'normal 20px Helvetica';
      this.ctx.fillText(child.name, child.pos.x, child.pos.y);
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
    window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change xy value on click / touchdown


      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },
    pointerup: function pointerup(e) {
      //if( this.active && e.pointerId === this.pointerId ) {
      //this.active = false
      //window.removeEventListener( 'pointermove', this.pointermove ) 
      //window.removeEventListener( 'pointerup',   this.pointerup ) 
      //}
      var touch = this.touches.find(function (t) {
        return t.pointerId === e.pointerId;
      });

      if (touch !== undefined) {
        //console.log( 'found', touch.name, e.pointerId )
        touch.vel.x = (e.clientX - touch.lastX) * .5;
        touch.vel.y = (e.clientY - touch.lastY) * .5;
        //console.log( touch.vel.x, e.clientX, touch.lastX, touch.pos.x  )
        touch.pointerId = null;
      } else {
        console.log('undefined touch', e.pointerId);
      }
    },
    pointermove: function pointermove(e) {
      var touch = this.touches.find(function (t) {
        return t.pointerId === e.pointerId;
      });

      if (touch !== undefined) {
        touch.lastX = touch.pos.x;
        touch.lastY = touch.pos.y;

        touch.pos.x = e.clientX;
        touch.pos.y = e.clientY;
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the XY's position, and triggers output.
   * @instance
   * @memberof XY
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var closestDiff = Infinity,
        touchFound = null,
        touchNum = null;

    for (var i = 0; i < this.touches.length; i++) {
      var touch = this.touches[i],
          xdiff = Math.abs(touch.pos.x - e.clientX),
          ydiff = Math.abs(touch.pos.y - e.clientY);

      if (xdiff + ydiff < closestDiff) {
        closestDiff = xdiff + ydiff;
        touchFound = touch;
        touchNum = i;
        //console.log( 'touch found', touchNum, closestDiff, e.pointerId )
      }
    }

    touchFound.isActive = true;
    touchFound.vel.x = 0;
    touchFound.vel.y = 0;
    touchFound.pos.x = touchFound.lastX = e.clientX;
    touchFound.pos.y = touchFound.lastY = e.clientY;
    touchFound.pointerId = e.pointerId;

    //touchFound.identifier = _touch.identifier
    //touchFound.childID = touchNum
    //if( this.style === 'horizontal' ) {
    //  sliderNum = Math.floor( ( e.clientY / this.rect.height ) / ( 1/this.count ) )
    //  this.__value[ sliderNum ] = ( e.clientX - this.rect.left ) / this.rect.width
    //}else{
    //  sliderNum = Math.floor( ( e.clientX / this.rect.width ) / ( 1/this.count ) )
    //  this.__value[ sliderNum ] = 1 - ( e.clientY - this.rect.top  ) / this.rect.height 
    //}

    //for( let i = 0; i < this.count; i++  ) {
    //  if( this.__value[ i ] > 1 ) this.__value[ i ] = 1
    //  if( this.__value[ i ] < 0 ) this.__value[ i ] = 0
    //}

    //let shouldDraw = this.output()

    //if( shouldDraw ) this.draw()
  }
});

module.exports = XY;

},{"./canvasWidget.js":2,"victor":20}],19:[function(require,module,exports){
/*!
 * PEP v0.4.1 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.PointerEventsPolyfill = factory()
}(this, function () { 'use strict';

  /**
   * This is the constructor for new PointerEvents.
   *
   * New Pointer Events must be given a type, and an optional dictionary of
   * initialization properties.
   *
   * Due to certain platform requirements, events returned from the constructor
   * identify as MouseEvents.
   *
   * @constructor
   * @param {String} inType The type of the event to create.
   * @param {Object} [inDict] An optional dictionary of initial event properties.
   * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
   */
  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  function PointerEvent(inType, inDict) {
    inDict = inDict || Object.create(null);

    var e = document.createEvent('Event');
    e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

    // define inherited MouseEvent properties
    // skip bubbles and cancelable since they're set above in initEvent()
    for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
      p = MOUSE_PROPS[i];
      e[p] = inDict[p] || MOUSE_DEFAULTS[i];
    }
    e.buttons = inDict.buttons || 0;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;
    if (inDict.pressure) {
      pressure = inDict.pressure;
    } else {
      pressure = e.buttons ? 0.5 : 0;
    }

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // define the properties of the PointerEvent interface
    e.pointerId = inDict.pointerId || 0;
    e.width = inDict.width || 0;
    e.height = inDict.height || 0;
    e.pressure = pressure;
    e.tiltX = inDict.tiltX || 0;
    e.tiltY = inDict.tiltY || 0;
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  var _PointerEvent = PointerEvent;

  /**
   * This module implements a map of pointer states
   */
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var PointerMap = USE_MAP ? Map : SparseArrayMap;

  function SparseArrayMap() {
    this.array = [];
    this.size = 0;
  }

  SparseArrayMap.prototype = {
    set: function(k, v) {
      if (v === undefined) {
        return this.delete(k);
      }
      if (!this.has(k)) {
        this.size++;
      }
      this.array[k] = v;
    },
    has: function(k) {
      return this.array[k] !== undefined;
    },
    delete: function(k) {
      if (this.has(k)) {
        delete this.array[k];
        this.size--;
      }
    },
    get: function(k) {
      return this.array[k];
    },
    clear: function() {
      this.array.length = 0;
      this.size = 0;
    },

    // return value, key, map
    forEach: function(callback, thisArg) {
      return this.array.forEach(function(v, k) {
        callback.call(thisArg, v, k, this);
      }, this);
    }
  };

  var _pointermap = PointerMap;

  var CLONE_PROPS = [

    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',

    // DOM Level 3
    'buttons',

    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',

    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp'
  ];

  var CLONE_DEFAULTS = [

    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,

    // DOM Level 3
    0,

    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,

    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var BOUNDARY_EVENTS = {
    'pointerover': 1,
    'pointerout': 1,
    'pointerenter': 1,
    'pointerleave': 1
  };

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    pointermap: new _pointermap(),
    eventMap: Object.create(null),
    captureInfo: Object.create(null),

    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    register: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.register.call(es, element);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    contains: /*scope.external.contains || */function(container, contained) {
      try {
        return container.contains(contained);
      } catch (ex) {

        // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
        return false;
      }
    },

    // EVENTS
    down: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerdown', inEvent);
    },
    move: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerenter', inEvent);
    },
    leave: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerover', inEvent);
    },
    out: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointercancel', inEvent);
    },
    leaveOut: function(event) {
      this.out(event);
      if (!this.contains(event.target, event.relatedTarget)) {
        this.leave(event);
      }
    },
    enterOver: function(event) {
      this.over(event);
      if (!this.contains(event.target, event.relatedTarget)) {
        this.enter(event);
      }
    },

    // LISTENER LOGIC
    eventHandler: function(inEvent) {

      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
      if (inEvent._handledByPE) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPE = true;
    },

    // set up event listeners
    listen: function(target, events) {
      events.forEach(function(e) {
        this.addEvent(target, e);
      }, this);
    },

    // remove event listeners
    unlisten: function(target, events) {
      events.forEach(function(e) {
        this.removeEvent(target, e);
      }, this);
    },
    addEvent: /*scope.external.addEvent || */function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: /*scope.external.removeEvent || */function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {

      // relatedTarget must be null if pointer is captured
      if (this.captureInfo[inEvent.pointerId]) {
        inEvent.relatedTarget = null;
      }
      var e = new _PointerEvent(inType, inEvent);
      if (inEvent.preventDefault) {
        e.preventDefault = inEvent.preventDefault;
      }
      e._target = e._target || inEvent.target;
      return e;
    },

    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null);
      var p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
          if (eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }

      // keep the semantics of preventDefault
      if (inEvent.preventDefault) {
        eventCopy.preventDefault = function() {
          inEvent.preventDefault();
        };
      }
      return eventCopy;
    },
    getTarget: function(inEvent) {
      var capture = this.captureInfo[inEvent.pointerId];
      if (!capture) {
        return inEvent._target;
      }
      if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
        return capture;
      }
    },
    setCapture: function(inPointerId, inTarget) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId);
      }
      this.captureInfo[inPointerId] = inTarget;
      var e = document.createEvent('Event');
      e.initEvent('gotpointercapture', true, false);
      e.pointerId = inPointerId;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);
      e._target = inTarget;
      this.asyncDispatchEvent(e);
    },
    releaseCapture: function(inPointerId) {
      var t = this.captureInfo[inPointerId];
      if (t) {
        var e = document.createEvent('Event');
        e.initEvent('lostpointercapture', true, false);
        e.pointerId = inPointerId;
        this.captureInfo[inPointerId] = undefined;
        document.removeEventListener('pointerup', this.implicitRelease);
        document.removeEventListener('pointercancel', this.implicitRelease);
        e._target = t;
        this.asyncDispatchEvent(e);
      }
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: /*scope.external.dispatchEvent || */function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    },
    asyncDispatchEvent: function(inEvent) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

  var _dispatcher = dispatcher;

  var targeting = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [];
      var s = this.shadow(element);
      while (s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr;

        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {

          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {

            // check for older shadows
            sr = this.olderShadow(sr);
          } else {

            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }

        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      var s = element;

      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }

      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX;
      var y = inEvent.clientY;

      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);

      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    }
  };

  /**
   * This module uses Mutation Observers to dynamically adjust which nodes will
   * generate Pointer Events.
   *
   * All nodes that wish to generate Pointer Events must have the attribute
   * `touch-action` set to `none`.
   */
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
  var MO = window.MutationObserver || window.WebKitMutationObserver;
  var SELECTOR = '[touch-action]';
  var OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['touch-action']
  };

  function Installer(add, remove, changed, binder) {
    this.addCallback = add.bind(binder);
    this.removeCallback = remove.bind(binder);
    this.changedCallback = changed.bind(binder);
    if (MO) {
      this.observer = new MO(this.mutationWatcher.bind(this));
    }
  }

  Installer.prototype = {
    watchSubtree: function(target) {

      // Only watch scopes that can target find, as these are top-level.
      // Otherwise we can see duplicate additions and removals that add noise.
      //
      // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
      // a removal without an insertion when a node is redistributed among
      // shadows. Since it all ends up correct in the document, watching only
      // the document will yield the correct mutations to watch.
      if (this.observer && targeting.canTarget(target)) {
        this.observer.observe(target, OBSERVER_INIT);
      }
    },
    enableOnSubtree: function(target) {
      this.watchSubtree(target);
      if (target === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.installNewSubtree(target);
      }
    },
    installNewSubtree: function(target) {
      forEach(this.findElements(target), this.addElement, this);
    },
    findElements: function(target) {
      if (target.querySelectorAll) {
        return target.querySelectorAll(SELECTOR);
      }
      return [];
    },
    removeElement: function(el) {
      this.removeCallback(el);
    },
    addElement: function(el) {
      this.addCallback(el);
    },
    elementChanged: function(el, oldValue) {
      this.changedCallback(el, oldValue);
    },
    concatLists: function(accum, list) {
      return accum.concat(toArray(list));
    },

    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {
          this.installNewSubtree(document);
        }
      }.bind(this));
    },
    isElement: function(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    },
    flattenMutationTree: function(inNodes) {

      // find children with touch-action
      var tree = map(inNodes, this.findElements, this);

      // make sure the added nodes are accounted for
      tree.push(filter(inNodes, this.isElement));

      // flatten the list
      return tree.reduce(this.concatLists, []);
    },
    mutationWatcher: function(mutations) {
      mutations.forEach(this.mutationHandler, this);
    },
    mutationHandler: function(m) {
      if (m.type === 'childList') {
        var added = this.flattenMutationTree(m.addedNodes);
        added.forEach(this.addElement, this);
        var removed = this.flattenMutationTree(m.removedNodes);
        removed.forEach(this.removeElement, this);
      } else if (m.type === 'attributes') {
        this.elementChanged(m.target, m.oldValue);
      }
    }
  };

  var installer = Installer;

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; touch-action-delay: none; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';

  // only install stylesheet if the browser has touch action support
  var hasNativePE = window.PointerEvent || window.MSPointerEvent;

  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  function applyAttributeStyles() {
    if (hasNativePE) {
      attrib2css.forEach(function(r) {
        if (String(r) === r) {
          styles += selector(r) + rule(r) + '\n';
          if (hasShadowRoot) {
            styles += shadowSelector(r) + rule(r) + '\n';
          }
        } else {
          styles += r.selectors.map(selector) + rule(r.rule) + '\n';
          if (hasShadowRoot) {
            styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
          }
        }
      });

      var el = document.createElement('style');
      el.textContent = styles;
      document.head.appendChild(el);
    }
  }

  var mouse__pointermap = _dispatcher.pointermap;

  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // left, middle, right, back, forward
  var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

  var HAS_BUTTONS = false;
  try {
    HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {}

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    register: function(target) {
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x);
        var dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = _dispatcher.cloneEvent(inEvent);

      // forward mouse preventDefault
      var pd = e.preventDefault;
      e.preventDefault = function() {
        inEvent.preventDefault();
        pd();
      };
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    prepareButtonsForMove: function(e, inEvent) {
      var p = mouse__pointermap.get(this.POINTER_ID);
      e.buttons = p ? p.buttons : 0;
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);
        if (!p) {
          _dispatcher.down(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        if (e.buttons === 0 || e.buttons === BUTTON_TO_BUTTONS[e.button]) {
          this.cleanupMouse();
          _dispatcher.up(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanupMouse();
    },
    cleanupMouse: function() {
      mouse__pointermap.delete(this.POINTER_ID);
    }
  };

  var mouse = mouseEvents;

  var captureInfo = _dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var touch__pointermap = _dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // The presence of touch event handlers blocks scrolling, and so we must be careful to
  // avoid adding handlers unnecessarily.  Chrome plans to add a touch-action-delay property
  // (crbug.com/329559) to address this, and once we have that we can opt-in to a simpler
  // handler registration mechanism.  Rather than try to predict how exactly to opt-in to
  // that we'll just leave this disabled until there is a build of Chrome to test.
  var HAS_TOUCH_ACTION_DELAY = false;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.listen(target, this.events);
      } else {
        INSTALLER.enableOnSubtree(target);
      }
    },
    unregister: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.unlisten(target, this.events);
      } else {

        // TODO(dfreedman): is it worth it to disconnect the MO?
      }
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        _dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          _dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      _dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        _dispatcher.unlisten(s, this.events);
      }, this);
    },
    elementChanged: function(el, oldValue) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      var oldSt = this.touchActionToScrollType(oldValue);

      // simply update scrollType if listeners are already established
      if (st && oldSt) {
        el._scrollType = st;
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
        }, this);
      } else if (oldSt) {
        this.elementRemoved(el);
      } else if (st) {
        this.elementAdded(el);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
      SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === 'none') {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else if (st.SCROLLER.exec(t)) {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {

      // set primary touch if there no pointers, or the only pointer is the mouse
      if (touch__pointermap.size === 0 || (touch__pointermap.size === 1 && touch__pointermap.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
        this.scrolling = false;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = _dispatcher.cloneEvent(inTouch);

      // We reserve pointerId 1 for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = captureInfo[id] || findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.button = 0;
      e.buttons = this.typeToButtons(cte.type);
      e.width = inTouch.radiusX || inTouch.webkitRadiusX || 0;
      e.height = inTouch.radiusY || inTouch.webkitRadiusY || 0;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t; i < tl.length; i++) {
        t = tl[i];
        inFunction.call(this, this.touchToPointer(t));
      }
    },

    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = inEvent.currentTarget._scrollType;
        if (scrollAxis === 'none') {

          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {

          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];

          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },

    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;

      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (touch__pointermap.size >= tl.length) {
        var d = [];
        touch__pointermap.forEach(function(value, key) {

          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value.out;
            d.push(p);
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      touch__pointermap.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      _dispatcher.over(inPointer);
      _dispatcher.enter(inPointer);
      _dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = touch__pointermap.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      _dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          _dispatcher.leaveOut(outEvent);
          _dispatcher.enterOver(event);
        } else {

          // clean up case when finger leaves the screen
          event.target = outTarget;
          event.relatedTarget = null;
          this.cancelOut(event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        _dispatcher.up(inPointer);
        _dispatcher.out(inPointer);
        _dispatcher.leave(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      _dispatcher.cancel(inPointer);
      _dispatcher.out(inPointer);
      _dispatcher.leave(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      touch__pointermap.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouse.lastTouches;
      var t = inEvent.changedTouches[0];

      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {

        // remember x/y of last touch
        var lt = { x: t.clientX, y: t.clientY };
        lts.push(lt);
        var fn = (function(lts, lt) {
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  if (!HAS_TOUCH_ACTION_DELAY) {
    INSTALLER = new installer(touchEvents.elementAdded, touchEvents.elementRemoved,
      touchEvents.elementChanged, touchEvents);
  }

  var touch = touchEvents;

  var ms__pointermap = _dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent &&
    typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      if (HAS_BITMAP_TYPE) {
        e = _dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      ms__pointermap.delete(id);
    },
    MSPointerDown: function(inEvent) {
      ms__pointermap.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      _dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('lostpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('gotpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    }
  };

  var ms = msEvents;

  function platform_events__applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = _PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        _dispatcher.registerSource('ms', ms);
      } else {
        _dispatcher.registerSource('mouse', mouse);
        if (window.ontouchstart !== undefined) {
          _dispatcher.registerSource('touch', touch);
        }
      }

      _dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s, r;
  function assertDown(id) {
    if (!_dispatcher.pointermap.has(id)) {
      throw new Error('InvalidPointerId');
    }
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertDown(pointerId);
      this.msSetPointerCapture(pointerId);
    };
    r = function(pointerId) {
      assertDown(pointerId);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.setCapture(pointerId, this);
    };
    r = function releasePointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.releaseCapture(pointerId, this);
    };
  }

  function _capture__applyPolyfill() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        }
      });
    }
  }

  applyAttributeStyles();
  platform_events__applyPolyfill();
  _capture__applyPolyfill();

  var pointerevents = {
    dispatcher: _dispatcher,
    Installer: installer,
    PointerEvent: _PointerEvent,
    PointerMap: _pointermap,
    targetFinding: targeting
  };

  return pointerevents;

}));
},{}],20:[function(require,module,exports){
exports = module.exports = Victor;

/**
 * # Victor - A JavaScript 2D vector class with methods for common vector operations
 */

/**
 * Constructor. Will also work without the `new` keyword
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = Victor(42, 1337);
 *
 * @param {Number} x Value of the x axis
 * @param {Number} y Value of the y axis
 * @return {Victor}
 * @api public
 */
function Victor (x, y) {
	if (!(this instanceof Victor)) {
		return new Victor(x, y);
	}

	/**
	 * The X axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.x;
	 *     // => 42
	 *
	 * @api public
	 */
	this.x = x || 0;

	/**
	 * The Y axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.y;
	 *     // => 21
	 *
	 * @api public
	 */
	this.y = y || 0;
};

/**
 * # Static
 */

/**
 * Creates a new instance from an array
 *
 * ### Examples:
 *     var vec = Victor.fromArray([42, 21]);
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromArray
 * @param {Array} array Array with the x and y values at index 0 and 1 respectively
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromArray = function (arr) {
	return new Victor(arr[0] || 0, arr[1] || 0);
};

/**
 * Creates a new instance from an object
 *
 * ### Examples:
 *     var vec = Victor.fromObject({ x: 42, y: 21 });
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromObject
 * @param {Object} obj Object with the values for x and y
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromObject = function (obj) {
	return new Victor(obj.x || 0, obj.y || 0);
};

/**
 * # Manipulation
 *
 * These functions are chainable.
 */

/**
 * Adds another vector's X axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addX(vec2);
 *     vec1.toString();
 *     // => x:30, y:10
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addX = function (vec) {
	this.x += vec.x;
	return this;
};

/**
 * Adds another vector's Y axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addY(vec2);
 *     vec1.toString();
 *     // => x:10, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addY = function (vec) {
	this.y += vec.y;
	return this;
};

/**
 * Adds another vector to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.add(vec2);
 *     vec1.toString();
 *     // => x:30, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

/**
 * Adds the given scalar to both vector axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalar(2);
 *     vec.toString();
 *     // => x: 3, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalar = function (scalar) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

/**
 * Adds the given scalar to the X axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarX(2);
 *     vec.toString();
 *     // => x: 3, y: 2
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarX = function (scalar) {
	this.x += scalar;
	return this;
};

/**
 * Adds the given scalar to the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarY(2);
 *     vec.toString();
 *     // => x: 1, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarY = function (scalar) {
	this.y += scalar;
	return this;
};

/**
 * Subtracts the X axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractX(vec2);
 *     vec1.toString();
 *     // => x:80, y:50
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractX = function (vec) {
	this.x -= vec.x;
	return this;
};

/**
 * Subtracts the Y axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractY(vec2);
 *     vec1.toString();
 *     // => x:100, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractY = function (vec) {
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtract(vec2);
 *     vec1.toString();
 *     // => x:80, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts the given scalar from both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalar(20);
 *     vec.toString();
 *     // => x: 80, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalar = function (scalar) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarX(20);
 *     vec.toString();
 *     // => x: 80, y: 200
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarX = function (scalar) {
	this.x -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarY(20);
 *     vec.toString();
 *     // => x: 100, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarY = function (scalar) {
	this.y -= scalar;
	return this;
};

/**
 * Divides the X axis by the x component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.divideX(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideX = function (vector) {
	this.x /= vector.x;
	return this;
};

/**
 * Divides the Y axis by the y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.divideY(vec2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideY = function (vector) {
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by a axis values of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.divide(vec2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Victor} vector The vector to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divide = function (vector) {
	this.x /= vector.x;
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalar(2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalar = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
		this.y /= scalar;
	} else {
		this.x = 0;
		this.y = 0;
	}

	return this;
};

/**
 * Divides the X axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarX(2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarX = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
	} else {
		this.x = 0;
	}
	return this;
};

/**
 * Divides the Y axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarY(2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarY = function (scalar) {
	if (scalar !== 0) {
		this.y /= scalar;
	} else {
		this.y = 0;
	}
	return this;
};

/**
 * Inverts the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertX();
 *     vec.toString();
 *     // => x:-100, y:50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertX = function () {
	this.x *= -1;
	return this;
};

/**
 * Inverts the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertY();
 *     vec.toString();
 *     // => x:100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertY = function () {
	this.y *= -1;
	return this;
};

/**
 * Inverts both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invert();
 *     vec.toString();
 *     // => x:-100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invert = function () {
	this.invertX();
	this.invertY();
	return this;
};

/**
 * Multiplies the X axis by X component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyX = function (vector) {
	this.x *= vector.x;
	return this;
};

/**
 * Multiplies the Y axis by Y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyY = function (vector) {
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by values from a given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.multiply(vec2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Victor} vector The vector to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiply = function (vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalar(2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Number} The scalar to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalar = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

/**
 * Multiplies the X axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarX(2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarX = function (scalar) {
	this.x *= scalar;
	return this;
};

/**
 * Multiplies the Y axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarY(2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarY = function (scalar) {
	this.y *= scalar;
	return this;
};

/**
 * Normalize
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.normalize = function () {
	var length = this.length();

	if (length === 0) {
		this.x = 1;
		this.y = 0;
	} else {
		this.divide(Victor(length, length));
	}
	return this;
};

Victor.prototype.norm = Victor.prototype.normalize;

/**
 * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.limit(80, 0.9);
 *     vec.toString();
 *     // => x:90, y:50
 *
 * @param {Number} max The maximum value for both x and y axis
 * @param {Number} factor Factor by which the axis are to be multiplied with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.limit = function (max, factor) {
	if (Math.abs(this.x) > max){ this.x *= factor; }
	if (Math.abs(this.y) > max){ this.y *= factor; }
	return this;
};

/**
 * Randomizes both vector axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:67, y:73
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomize = function (topLeft, bottomRight) {
	this.randomizeX(topLeft, bottomRight);
	this.randomizeY(topLeft, bottomRight);

	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:55, y:50
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeX = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.x, bottomRight.x);
	var max = Math.max(topLeft.x, bottomRight.x);
	this.x = random(min, max);
	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:100, y:66
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeY = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.y, bottomRight.y);
	var max = Math.max(topLeft.y, bottomRight.y);
	this.y = random(min, max);
	return this;
};

/**
 * Randomly randomizes either axis between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
 *     vec.toString();
 *     // => x:100, y:77
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
	if (!! Math.round(Math.random())) {
		this.randomizeX(topLeft, bottomRight);
	} else {
		this.randomizeY(topLeft, bottomRight);
	}
	return this;
};

/**
 * Rounds both axis to an integer value
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.unfloat = function () {
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};

/**
 * Rounds both axis to a certain precision
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @param {Number} Precision (default: 8)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.toFixed = function (precision) {
	if (typeof precision === 'undefined') { precision = 8; }
	this.x = this.x.toFixed(precision);
	this.y = this.y.toFixed(precision);
	return this;
};

/**
 * Performs a linear blend / interpolation of the X axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixX(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:100
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixX = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.x = (1 - amount) * this.x + amount * vec.x;
	return this;
};

/**
 * Performs a linear blend / interpolation of the Y axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixY(vec2, 0.5);
 *     vec.toString();
 *     // => x:100, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixY = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.y = (1 - amount) * this.y + amount * vec.y;
	return this;
};

/**
 * Performs a linear blend / interpolation towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mix(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mix = function (vec, amount) {
	this.mixX(vec, amount);
	this.mixY(vec, amount);
	return this;
};

/**
 * # Products
 */

/**
 * Creates a clone of this vector
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = vec1.clone();
 *
 *     vec2.toString();
 *     // => x:10, y:10
 *
 * @return {Victor} A clone of the vector
 * @api public
 */
Victor.prototype.clone = function () {
	return new Victor(this.x, this.y);
};

/**
 * Copies another vector's X component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyX(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:10
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyX = function (vec) {
	this.x = vec.x;
	return this;
};

/**
 * Copies another vector's Y component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyY(vec1);
 *
 *     vec2.toString();
 *     // => x:10, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyY = function (vec) {
	this.y = vec.y;
	return this;
};

/**
 * Copies another vector's X and Y components in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copy(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copy = function (vec) {
	this.copyX(vec);
	this.copyY(vec);
	return this;
};

/**
 * Sets the vector to zero (0,0)
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *		 var1.zero();
 *     vec1.toString();
 *     // => x:0, y:0
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.zero = function () {
	this.x = this.y = 0;
	return this;
};

/**
 * Calculates the dot product of this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.dot(vec2);
 *     // => 23000
 *
 * @param {Victor} vector The second vector
 * @return {Number} Dot product
 * @api public
 */
Victor.prototype.dot = function (vec2) {
	return this.x * vec2.x + this.y * vec2.y;
};

Victor.prototype.cross = function (vec2) {
	return (this.x * vec2.y ) - (this.y * vec2.x );
};

/**
 * Projects a vector onto another vector, setting itself to the result.
 *
 * ### Examples:
 *     var vec = new Victor(100, 0);
 *     var vec2 = new Victor(100, 100);
 *
 *     vec.projectOnto(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want to project this vector onto
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.projectOnto = function (vec2) {
    var coeff = ( (this.x * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
    this.x = coeff * vec2.x;
    this.y = coeff * vec2.y;
    return this;
};


Victor.prototype.horizontalAngle = function () {
	return Math.atan2(this.y, this.x);
};

Victor.prototype.horizontalAngleDeg = function () {
	return radian2degrees(this.horizontalAngle());
};

Victor.prototype.verticalAngle = function () {
	return Math.atan2(this.x, this.y);
};

Victor.prototype.verticalAngleDeg = function () {
	return radian2degrees(this.verticalAngle());
};

Victor.prototype.angle = Victor.prototype.horizontalAngle;
Victor.prototype.angleDeg = Victor.prototype.horizontalAngleDeg;
Victor.prototype.direction = Victor.prototype.horizontalAngle;

Victor.prototype.rotate = function (angle) {
	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

	this.x = nx;
	this.y = ny;

	return this;
};

Victor.prototype.rotateDeg = function (angle) {
	angle = degrees2radian(angle);
	return this.rotate(angle);
};

Victor.prototype.rotateTo = function(rotation) {
	return this.rotate(rotation-this.angle());
};

Victor.prototype.rotateToDeg = function(rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateTo(rotation);
};

Victor.prototype.rotateBy = function (rotation) {
	var angle = this.angle() + rotation;

	return this.rotate(angle);
};

Victor.prototype.rotateByDeg = function (rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateBy(rotation);
};

/**
 * Calculates the distance of the X axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceX(vec2);
 *     // => -100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceX = function (vec) {
	return this.x - vec.x;
};

/**
 * Same as `distanceX()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.absDistanceX(vec2);
 *     // => 100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceX = function (vec) {
	return Math.abs(this.distanceX(vec));
};

/**
 * Calculates the distance of the Y axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => -10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceY = function (vec) {
	return this.y - vec.y;
};

/**
 * Same as `distanceY()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => 10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceY = function (vec) {
	return Math.abs(this.distanceY(vec));
};

/**
 * Calculates the euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distance(vec2);
 *     // => 100.4987562112089
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distance = function (vec) {
	return Math.sqrt(this.distanceSq(vec));
};

/**
 * Calculates the squared euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceSq(vec2);
 *     // => 10100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceSq = function (vec) {
	var dx = this.distanceX(vec),
		dy = this.distanceY(vec);

	return dx * dx + dy * dy;
};

/**
 * Calculates the length or magnitude of the vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.length();
 *     // => 111.80339887498948
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.length = function () {
	return Math.sqrt(this.lengthSq());
};

/**
 * Squared length / magnitude
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.lengthSq();
 *     // => 12500
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.lengthSq = function () {
	return this.x * this.x + this.y * this.y;
};

Victor.prototype.magnitude = Victor.prototype.length;

/**
 * Returns a true if vector is (0, 0)
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.zero();
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
};

/**
 * Returns a true if this vector is the same as another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(100, 50);
 *     vec1.isEqualTo(vec2);
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isEqualTo = function(vec2) {
	return this.x === vec2.x && this.y === vec2.y;
};

/**
 * # Utility Methods
 */

/**
 * Returns an string representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toString();
 *     // => x:10, y:20
 *
 * @return {String}
 * @api public
 */
Victor.prototype.toString = function () {
	return 'x:' + this.x + ', y:' + this.y;
};

/**
 * Returns an array representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toArray();
 *     // => [10, 20]
 *
 * @return {Array}
 * @api public
 */
Victor.prototype.toArray = function () {
	return [ this.x, this.y ];
};

/**
 * Returns an object representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toObject();
 *     // => { x: 10, y: 20 }
 *
 * @return {Object}
 * @api public
 */
Victor.prototype.toObject = function () {
	return { x: this.x, y: this.y };
};


var degrees = 180 / Math.PI;

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function radian2degrees (rad) {
	return rad * degrees;
}

function degrees2radian (deg) {
	return deg / degrees;
}

},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idXR0b24uanMiLCJqcy9jYW52YXNXaWRnZXQuanMiLCJqcy9jb21tdW5pY2F0aW9uLmpzIiwianMvZG9tV2lkZ2V0LmpzIiwianMvZmlsdGVycy5qcyIsImpzL2luZGV4LmpzIiwianMvam95c3RpY2suanMiLCJqcy9rZXlib2FyZC5qcyIsImpzL2tub2IuanMiLCJqcy9tZW51LmpzIiwianMvbXVsdGlCdXR0b24uanMiLCJqcy9tdWx0aXNsaWRlci5qcyIsImpzL3BhbmVsLmpzIiwianMvc2xpZGVyLmpzIiwianMvdXRpbGl0aWVzLmpzIiwianMvd2lkZ2V0LmpzIiwianMvd2lkZ2V0TGFiZWwuanMiLCJqcy94eS5qcyIsIm5vZGVfbW9kdWxlcy9wZXBqcy9kaXN0L3BlcC5qcyIsIm5vZGVfbW9kdWxlcy92aWN0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0FBRUE7Ozs7Ozs7OztBQVNBLElBQUksU0FBUyxPQUFPLE1BQVAsd0JBQWI7O0FBRUEsT0FBTyxNQUFQLENBQWUsTUFBZixFQUF1Qjs7QUFFckI7O0FBRUE7Ozs7Ozs7QUFPQSxZQUFVO0FBQ1IsYUFBUSxDQURBO0FBRVIsV0FBTSxDQUZFO0FBR1IsWUFBUSxLQUhBOztBQUtSOzs7Ozs7O0FBT0EsV0FBUTtBQVpBLEdBWFc7O0FBMEJyQjs7Ozs7OztBQU9BLFFBakNxQixrQkFpQ2IsS0FqQ2EsRUFpQ0w7QUFDZCxRQUFJLFNBQVMsT0FBTyxNQUFQLENBQWUsSUFBZixDQUFiOztBQUVBLDJCQUFhLE1BQWIsQ0FBb0IsSUFBcEIsQ0FBMEIsTUFBMUI7O0FBRUEsV0FBTyxNQUFQLENBQWUsTUFBZixFQUF1QixPQUFPLFFBQTlCLEVBQXdDLEtBQXhDOztBQUVBLFFBQUksTUFBTSxLQUFWLEVBQWtCLE9BQU8sT0FBUCxHQUFpQixNQUFNLEtBQXZCOztBQUVsQixXQUFP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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3A1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0J1xuXG4vKipcbiAqIEEgQnV0dG9uIHdpdGggdGhyZWUgZGlmZmVyZW50IHN0eWxlczogJ21vbWVudGFyeScgdHJpZ2dlcnMgYSBmbGFzaCBhbmQgaW5zdGFuZW91cyBvdXRwdXQsIFxuICogJ2hvbGQnIG91dHB1dHMgdGhlIGJ1dHRvbnMgbWF4aW11bSB2YWx1ZSB1bnRpbCBpdCBpcyByZWxlYXNlZCwgYW5kICd0b2dnbGUnIGFsdGVybmF0ZXMgXG4gKiBiZXR3ZWVuIG91dHB1dHRpbmcgbWF4aW11bSBhbmQgbWluaW11bSB2YWx1ZXMgb24gcHJlc3MuIFxuICogXG4gKiBAbW9kdWxlIEJ1dHRvblxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggQnV0dG9uLCB7XG5cbiAgLyoqIEBsZW5kcyBCdXR0b24ucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBCdXR0b24gaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTowLFxuICAgIHZhbHVlOjAsXG4gICAgYWN0aXZlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgJ21vbWVudGFyeScsICdob2xkJywgb3IgJ3RvZ2dsZScuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBpbnRlcmFjdGlvbiBvZiB0aGUgQnV0dG9uIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ3RvZ2dsZSdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEJ1dHRvbiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgYSBCdXR0b24gaW5zdGFuY2Ugd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgYnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBidXR0b24gKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggYnV0dG9uLCBCdXR0b24uZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy52YWx1ZSApIGJ1dHRvbi5fX3ZhbHVlID0gcHJvcHMudmFsdWVcblxuICAgIGJ1dHRvbi5pbml0KClcblxuICAgIHJldHVybiBidXR0b25cbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgQnV0dG9uIGludG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5IGFuZCBidXR0b24gc3R5bGUuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5fX3ZhbHVlID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICAvLyBvbmx5IGhvbGQgbmVlZHMgdG8gbGlzdGVuIGZvciBwb2ludGVydXAgZXZlbnRzOyB0b2dnbGUgYW5kIG1vbWVudGFyeSBvbmx5IGNhcmUgYWJvdXQgcG9pbnRlcmRvd25cbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cblxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICd0b2dnbGUnICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSB0aGlzLl9fdmFsdWUgPT09IDEgPyAwIDogMVxuICAgICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdtb21lbnRhcnknICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxXG4gICAgICAgIHNldFRpbWVvdXQoICgpPT4geyB0aGlzLl9fdmFsdWUgPSAwOyB0aGlzLmRyYXcoKSB9LCA1MCApXG4gICAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxXG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMub3V0cHV0KClcblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCAmJiB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApXG5cbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMFxuICAgICAgICB0aGlzLm91dHB1dCgpXG5cbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEJ1dHRvblxuIiwiaW1wb3J0IERPTVdpZGdldCBmcm9tICcuL2RvbVdpZGdldCdcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSAnLi91dGlsaXRpZXMnXG5pbXBvcnQgV2lkZ2V0TGFiZWwgZnJvbSAnLi93aWRnZXRMYWJlbCdcblxuLyoqXG4gKiBDYW52YXNXaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIHdpZGdldHMgdGhhdCB1c2UgSFRNTCBjYW52YXMgZWxlbWVudHMuXG4gKiBAbW9kdWxlIENhbnZhc1dpZGdldFxuICogQGF1Z21lbnRzIERPTVdpZGdldFxuICovIFxuXG5sZXQgQ2FudmFzV2lkZ2V0ID0gT2JqZWN0LmNyZWF0ZSggRE9NV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggQ2FudmFzV2lkZ2V0LCB7XG4gIC8qKiBAbGVuZHMgQ2FudmFzV2lkZ2V0LnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IGNvbG9ycyBhbmQgY2FudmFzIGNvbnRleHQgcHJvcGVydGllcyBmb3IgdXNlIGluIENhbnZhc1dpZGdldHNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIGJhY2tncm91bmQ6JyM4ODgnLFxuICAgIGZpbGw6JyNhYWEnLFxuICAgIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwuMyknLFxuICAgIGxpbmVXaWR0aDo0LFxuICAgIGRlZmF1bHRMYWJlbDoge1xuICAgICAgeDouNSwgeTouNSwgYWxpZ246J2NlbnRlcicsIHdpZHRoOjEsIHRleHQ6J2RlbW8nXG4gICAgfSxcbiAgICBzaG91bGREaXNwbGF5VmFsdWU6ZmFsc2VcbiAgfSxcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBDYW52YXNXaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICBET01XaWRnZXQuY3JlYXRlLmNhbGwoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgQ2FudmFzV2lkZ2V0LmRlZmF1bHRzIClcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBjYW52YXMgMkQgY29udGV4dC5cbiAgICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1cbiAgICAgKi9cbiAgICB0aGlzLmN0eCA9IHRoaXMuZWxlbWVudC5nZXRDb250ZXh0KCAnMmQnIClcblxuICAgIHRoaXMuYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2ggKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSB0aGUgY2FudmFzIGVsZW1lbnQgdXNlZCBieSB0aGUgd2lkZ2V0IGFuZCBzZXRcbiAgICogc29tZSBkZWZhdWx0IENTUyB2YWx1ZXMuXG4gICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnIClcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3RvdWNoLWFjdGlvbicsICdub25lJyApXG4gICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIFxuICAgIHJldHVybiBlbGVtZW50XG4gIH0sXG5cbiAgYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2g9ZmFsc2UgKSB7XG4gICAgbGV0IGhhbmRsZXJzID0gc2hvdWxkVXNlVG91Y2ggPyBDYW52YXNXaWRnZXQuaGFuZGxlcnMudG91Y2ggOiBDYW52YXNXaWRnZXQuaGFuZGxlcnMubW91c2VcbiAgICBcbiAgICAvLyB3aWRnZXRzIGhhdmUgaWpzIGRlZmluZWQgaGFuZGxlcnMgc3RvcmVkIGluIHRoZSBfZXZlbnRzIGFycmF5LFxuICAgIC8vIGFuZCB1c2VyLWRlZmluZWQgZXZlbnRzIHN0b3JlZCB3aXRoICdvbicgcHJlZml4ZXMgKGUuZy4gb25jbGljaywgb25tb3VzZWRvd24pXG4gICAgZm9yKCBsZXQgaGFuZGxlck5hbWUgb2YgaGFuZGxlcnMgKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggaGFuZGxlck5hbWUsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSAgPT09ICdmdW5jdGlvbicgICkgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0oIGV2ZW50IClcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0sXG5cbiAgaGFuZGxlcnM6IHtcbiAgICBtb3VzZTogW1xuICAgICAgJ21vdXNldXAnLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2Vkb3duJyxcbiAgICBdLFxuICAgIHRvdWNoOiBbXVxuICB9LFxuXG4gIGFkZExhYmVsKCkge1xuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHsgY3R4OiB0aGlzLmN0eCB9LCB0aGlzLmxhYmVsIHx8IHRoaXMuZGVmYXVsdExhYmVsICksXG4gICAgICAgIGxhYmVsID0gV2lkZ2V0TGFiZWwuY3JlYXRlKCBwcm9wcyApXG5cbiAgICB0aGlzLmxhYmVsID0gbGFiZWxcbiAgICB0aGlzLl9kcmF3ID0gdGhpcy5kcmF3XG4gICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9kcmF3KClcbiAgICAgIHRoaXMubGFiZWwuZHJhdygpXG4gICAgfVxuICB9LFxuXG4gIF9fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAgIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgdGhpcy5wbGFjZSgpIFxuXG4gICAgaWYoIHRoaXMubGFiZWwgfHwgdGhpcy5zaG91bGREaXNwbGF5VmFsdWUgKSB0aGlzLmFkZExhYmVsKClcbiAgICBpZiggdGhpcy5zaG91bGREaXNwbGF5VmFsdWUgKSB7XG4gICAgICB0aGlzLl9fcG9zdGZpbHRlcnMucHVzaCggKCB2YWx1ZSApID0+IHsgXG4gICAgICAgIHRoaXMubGFiZWwudGV4dCA9IHZhbHVlLnRvRml4ZWQoIDUgKVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuZHJhdygpICAgICBcblxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBDYW52YXNXaWRnZXRcbiIsImltcG9ydCBXaWRnZXQgZnJvbSAnLi93aWRnZXQnXG5cbmxldCBDb21tdW5pY2F0aW9uID0ge1xuICBTb2NrZXQgOiBudWxsLFxuICBpbml0aWFsaXplZDogZmFsc2UsXG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLlNvY2tldCA9IG5ldyBXZWJTb2NrZXQoIHRoaXMuZ2V0U2VydmVyQWRkcmVzcygpIClcbiAgICB0aGlzLlNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLm9ubWVzc2FnZVxuXG4gICAgbGV0IGZ1bGxMb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpLFxuICAgICAgICBsb2NhdGlvblNwbGl0ID0gZnVsbExvY2F0aW9uLnNwbGl0KCAnLycgKSxcbiAgICAgICAgaW50ZXJmYWNlTmFtZSA9IGxvY2F0aW9uU3BsaXRbIGxvY2F0aW9uU3BsaXQubGVuZ3RoIC0gMSBdXG4gICAgXG4gICAgdGhpcy5Tb2NrZXQub25vcGVuID0gKCk9PiB7XG4gICAgICB0aGlzLlNvY2tldC5zZW5kKCBKU09OLnN0cmluZ2lmeSh7IHR5cGU6J21ldGEnLCBpbnRlcmZhY2VOYW1lLCBrZXk6J3JlZ2lzdGVyJyB9KSApXG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgfSxcblxuICBnZXRTZXJ2ZXJBZGRyZXNzKCkge1xuICAgIGxldCBleHByLCBzb2NrZXRJUEFuZFBvcnQsIHNvY2tldFN0cmluZywgaXAsIHBvcnRcblxuICAgIGV4cHIgPSAvWy1hLXpBLVowLTkuXSsoOig2NTUzWzAtNV18NjU1WzAtMl1cXGR8NjVbMC00XVxcZHsyfXw2WzAtNF1cXGR7M318WzEtNV1cXGR7NH18WzEtOV1cXGR7MCwzfSkpL1xuXG4gICAgc29ja2V0SVBBbmRQb3J0ID0gZXhwci5leGVjKCB3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSApWyAwIF0uc3BsaXQoICc6JyApXG4gICAgaXAgPSBzb2NrZXRJUEFuZFBvcnRbIDAgXVxuICAgIHBvcnQgPSBwYXJzZUludCggc29ja2V0SVBBbmRQb3J0WyAxIF0gKVxuXG4gICAgc29ja2V0U3RyaW5nID0gYHdzOi8vJHtpcH06JHtwb3J0fWBcblxuICAgIHJldHVybiBzb2NrZXRTdHJpbmdcbiAgfSxcblxuICBvbm1lc3NhZ2UoIGUgKSB7XG4gICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCBlLmRhdGEgKVxuICAgIGlmKCBkYXRhLnR5cGUgPT09ICdvc2MnICkge1xuICAgICAgQ29tbXVuaWNhdGlvbi5PU0MuX3JlY2VpdmUoIGUuZGF0YSApO1xuICAgIH1lbHNlIHtcbiAgICAgIGlmKCBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlICkge1xuICAgICAgICBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlKCBkYXRhLmFkZHJlc3MsIGRhdGEucGFyYW1ldGVycyAgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBPU0MgOiB7XG4gICAgY2FsbGJhY2tzOiB7fSxcbiAgICBvbm1lc3NhZ2U6IG51bGwsXG5cbiAgICBzZW5kKCBhZGRyZXNzLCBwYXJhbWV0ZXJzICkge1xuICAgICAgaWYoIENvbW11bmljYXRpb24uU29ja2V0LnJlYWR5U3RhdGUgPT09IDEgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgbGV0IG1zZyA9IHtcbiAgICAgICAgICAgIHR5cGUgOiBcIm9zY1wiLFxuICAgICAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgICAgICdwYXJhbWV0ZXJzJzogQXJyYXkuaXNBcnJheSggcGFyYW1ldGVycyApID8gcGFyYW1ldGVycyA6IFsgcGFyYW1ldGVycyBdLFxuICAgICAgICAgIH1cblxuICAgICAgICAgIENvbW11bmljYXRpb24uU29ja2V0LnNlbmQoIEpTT04uc3RyaW5naWZ5KCBtc2cgKSApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRocm93IEVycm9yKCAnSW52YWxpZCBvc2MgbWVzc2FnZTonLCBhcmd1bWVudHMgKSAgIFxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgRXJyb3IoICdTb2NrZXQgaXMgbm90IHlldCBjb25uZWN0ZWQ7IGNhbm5vdCBzZW5kIE9TQyBtZXNzc2FnZXMuJyApXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgcmVjZWl2ZSggZGF0YSApIHtcbiAgICAgIGxldCBtc2cgPSBKU09OLnBhcnNlKCBkYXRhIClcblxuICAgICAgaWYoIG1zZy5hZGRyZXNzIGluIHRoaXMuY2FsbGJhY2tzICkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1sgbXNnLmFkZHJlc3MgXSggbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGZvciggbGV0IHdpZGdldCBvZiBXaWRnZXQud2lkZ2V0cyApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCBcIkNIRUNLXCIsIGNoaWxkLmtleSwgbXNnLmFkZHJlc3MgKVxuICAgICAgICAgIGlmKCB3aWRnZXQua2V5ID09PSBtc2cuYWRkcmVzcyApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGNoaWxkLmtleSwgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICAgICAgd2lkZ2V0LnNldFZhbHVlLmFwcGx5KCB3aWRnZXQsIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfSAgICBcblxuICAgICAgICBpZiggdGhpcy5vbm1lc3NhZ2UgIT09IG51bGwgKSB7IFxuICAgICAgICAgIHRoaXMucmVjZWl2ZSggbXNnLmFkZHJlc3MsIG1zZy50eXBldGFncywgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tbXVuaWNhdGlvblxuIiwiaW1wb3J0IFdpZGdldCBmcm9tICcuL3dpZGdldCdcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSAnLi91dGlsaXRpZXMnXG5cbi8qKlxuICogRE9NV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIGZvciB3aWRnZXRzIHRoYXQgdXNlIEhUTUwgY2FudmFzIGVsZW1lbnRzLlxuICogQGF1Z21lbnRzIFdpZGdldFxuICovXG5cbmxldCBET01XaWRnZXQgPSBPYmplY3QuY3JlYXRlKCBXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBET01XaWRnZXQsIHtcbiAgLyoqIEBsZW5kcyBET01XaWRnZXQucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBET01XaWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlLFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgRE9NV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICBXaWRnZXQuY3JlYXRlLmNhbGwoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgRE9NV2lkZ2V0LmRlZmF1bHRzIClcblxuICAgIC8vIEFMTCBJTlNUQU5DRVMgT0YgRE9NV0lER0VUIE1VU1QgSU1QTEVNRU5UIENSRUFURSBFTEVNRU5UXG4gICAgaWYoIHR5cGVvZiB0aGlzLmNyZWF0ZUVsZW1lbnQgPT09ICdmdW5jdGlvbicgKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIERPTSBlbGVtZW50IHVzZWQgYnkgdGhlIERPTVdpZGdldFxuICAgICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAgICogQGluc3RhbmNlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY3JlYXRlRWxlbWVudCgpXG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICd3aWRnZXQgaW5oZXJpdGluZyBmcm9tIERPTVdpZGdldCBkb2VzIG5vdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCBtZXRob2Q7IHRoaXMgaXMgcmVxdWlyZWQuJyApXG4gICAgfVxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIERPTSBlbGVtZW50IHRvIGJlIHBsYWNlZCBpbiBhIFBhbmVsLlxuICAgKiBAdmlydHVhbFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgdGhyb3cgRXJyb3IoICdhbGwgc3ViY2xhc3NlcyBvZiBET01XaWRnZXQgbXVzdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCgpJyApXG4gIH0sXG5cbiAgLyoqXG4gICAqIHVzZSBDU1MgdG8gcG9zaXRpb24gZWxlbWVudCBlbGVtZW50IG9mIHdpZGdldFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqL1xuICBwbGFjZSgpIHtcbiAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ9IHRoaXMuY29udGFpbmVyLmdldEhlaWdodCgpLFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICA8PSAxID8gY29udGFpbmVyV2lkdGggICogdGhpcy53aWR0aCA6IHRoaXMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0IDw9IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLmhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMueCA8IDEgPyBjb250YWluZXJXaWR0aCAgKiB0aGlzLnggOiB0aGlzLngsXG4gICAgICAgIHkgICAgICA9IHRoaXMueSA8IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLnkgOiB0aGlzLnlcblxuICAgIGlmKCAhdGhpcy5hdHRhY2hlZCApIHtcbiAgICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgfVxuICBcbiAgICBpZiggdGhpcy5pc1NxdWFyZSApIHtcbiAgICAgIGlmKCBoZWlnaHQgPiB3aWR0aCApIHtcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGhcbiAgICAgIH1lbHNle1xuICAgICAgICB3aWR0aCA9IGhlaWdodFxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC53aWR0aCAgPSB3aWR0aFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0geVxuXG4gICAgLyoqXG4gICAgICogQm91bmRpbmcgYm94LCBpbiBhYnNvbHV0ZSBjb29yZGluYXRlcywgb2YgdGhlIERPTVdpZGdldFxuICAgICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMucmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBcblxuICAgIGlmKCB0eXBlb2YgdGhpcy5vbnBsYWNlID09PSAnZnVuY3Rpb24nICkgdGhpcy5vbnBsYWNlKClcbiAgfSxcbiAgXG59KVxuXG5leHBvcnQgZGVmYXVsdCBET01XaWRnZXRcbiIsImxldCBGaWx0ZXJzID0ge1xuICBTY2FsZSggaW5taW49MCwgaW5tYXg9MSwgb3V0bWluPS0xLCBvdXRtYXg9MSApIHtcbiAgICBsZXQgaW5yYW5nZSAgPSBpbm1heCAtIGlubWluLFxuICAgICAgICBvdXRyYW5nZSA9IG91dG1heCAtIG91dG1pbixcbiAgICAgICAgcmFuZ2VSYXRpbyA9IG91dHJhbmdlIC8gaW5yYW5nZVxuXG4gICAgcmV0dXJuIGlucHV0ID0+IG91dG1pbiArIGlucHV0ICogcmFuZ2VSYXRpb1xuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJzXG4iLCIvLyBFdmVyeXRoaW5nIHdlIG5lZWQgdG8gaW5jbHVkZSBnb2VzIGhlcmUgYW5kIGlzIGZlZCB0byBicm93c2VyaWZ5IGluIHRoZSBndWxwZmlsZS5qc1xuXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi9wYW5lbCdcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi9zbGlkZXInXG5pbXBvcnQgSm95c3RpY2sgZnJvbSAnLi9qb3lzdGljaydcbmltcG9ydCBCdXR0b24gZnJvbSAnLi9idXR0b24nXG5pbXBvcnQgTWVudSBmcm9tICcuL21lbnUnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24nXG5pbXBvcnQgUEVQIGZyb20gJ3BlcGpzJ1xuaW1wb3J0IEtub2IgZnJvbSAnLi9rbm9iJ1xuaW1wb3J0IE11bHRpU2xpZGVyIGZyb20gJy4vbXVsdGlzbGlkZXInXG5pbXBvcnQgTXVsdGlCdXR0b24gZnJvbSAnLi9tdWx0aUJ1dHRvbidcbmltcG9ydCBLZXlib2FyZCBmcm9tICcuL2tleWJvYXJkJ1xuaW1wb3J0IFhZIGZyb20gJy4veHknXG5cbmV4cG9ydCB7XG4gIFBhbmVsLCBcbiAgU2xpZGVyLCBcbiAgSm95c3RpY2ssIFxuICBCdXR0b24sIFxuICBNZW51LCBcbiAgQ29tbXVuaWNhdGlvbiwgXG4gIEtub2IsIFxuICBNdWx0aVNsaWRlciwgXG4gIE11bHRpQnV0dG9uLCBcbiAgS2V5Ym9hcmQsXG4gIFhZXG59XG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgam95c3RpY2sgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWxlY3QgYW4gWFkgcG9zaXRpb24gYW5kIHRoZW4gc25hcHMgYmFjay4gXG4gKiBAbW9kdWxlIEpveXN0aWNrXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBKb3lzdGljayA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBKb3lzdGljaywge1xuICAvKiogQGxlbmRzIEpveXN0aWNrLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgSm95c3RpY2sgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOlsuNSwuNV0sIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6Wy41LC41XSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBKb3lzdGljayBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBTbGlkZXIgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgam95c3RpY2sgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIFNsaWRlciBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggam95c3RpY2sgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBqb3lzdGljaywgSm95c3RpY2suZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkgam95c3RpY2suX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBqb3lzdGljay5pbml0KClcblxuICAgIHJldHVybiBqb3lzdGlja1xuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBKb3lzdGljayBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgcGVycF9ub3JtX3ZlY3Rvcih2YWx1ZSkge1xuICAgIGxldCB4MSA9IHZhbHVlWzBdLS41XG4gICAgbGV0IHkxID0gdmFsdWVbMV0tLjVcbiAgICBsZXQgeDIgPSAwLjBcbiAgICBsZXQgeTIgPSAtKHgxL3kxKSooeDIteDEpK3kxXG4gICAgbGV0IHgzID0geDIteDFcbiAgICBsZXQgeTMgPSB5Mi15MVxuICAgIGxldCBtID0gTWF0aC5zcXJ0KHgzKngzK3kzKnkzKVxuICAgIHgzID0geDMvbVxuICAgIHkzID0geTMvbVxuXG4gICAgcmV0dXJuIFt4Myx5M11cbiAgfSxcblxuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAoc2xpZGVyIHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuICAgIGxldCB2ID0gdGhpcy5wZXJwX25vcm1fdmVjdG9yKHRoaXMuX192YWx1ZSlcbiAgICBsZXQgciA9IDE1LjBcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLnJlY3Qud2lkdGgqMC41ICsgcip2WzBdKi4yNSx0aGlzLnJlY3QuaGVpZ2h0Ki41ICsgcip2WzFdKi4yNSk7XG4gICAgdGhpcy5jdHgubGluZVRvKHRoaXMucmVjdC53aWR0aCAqdGhpcy5fX3ZhbHVlWzBdK3IqdlswXSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsxXStyKnZbMV0pO1xuICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLnJlY3Qud2lkdGggKnRoaXMuX192YWx1ZVswXS1yKnZbMF0sIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWVbMV0tcip2WzFdKTtcbiAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5yZWN0LndpZHRoKjAuNSAtIHIqdlswXSouMjUsdGhpcy5yZWN0LmhlaWdodCouNSAtIHIqdlsxXSouMjUpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgLy8gIHRoaXMuY3R4LmZpbGxSZWN0KCB0aGlzLnJlY3Qud2lkdGggKiB0aGlzLl9fdmFsdWVbMF0gLTEyLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWzFdIC0xMiwgMjQsIDI0IClcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5hcmModGhpcy5yZWN0LndpZHRoICp0aGlzLl9fdmFsdWVbMF0sdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsxXSxyLDAsMipNYXRoLlBJKTtcbiAgICB0aGlzLmN0eC5maWxsKCk7XG5cblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LmFyYyh0aGlzLnJlY3Qud2lkdGggKjAuNSx0aGlzLnJlY3QuaGVpZ2h0ICogMC41LHIqLjI1LDAsMipNYXRoLlBJKTtcbiAgICB0aGlzLmN0eC5maWxsKCk7XG5cblxuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSAvLyBjaGFuZ2Ugc2xpZGVyIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgICB0aGlzLl9fdmFsdWUgPSBbLjUsLjVdXG4gICAgICAgIHRoaXMub3V0cHV0KClcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgSm95c3RpY2sncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBKb3lzdGlja1xuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG5cbiAgICB0aGlzLl9fdmFsdWVbMF0gPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICB0aGlzLl9fdmFsdWVbMV0gPSAoIGUuY2xpZW50WSAtIHRoaXMucmVjdC50b3AgICkgLyB0aGlzLnJlY3QuaGVpZ2h0IFxuICAgIFxuXG4gICAgLy8gY2xhbXAgX192YWx1ZSwgd2hpY2ggaXMgb25seSB1c2VkIGludGVybmFsbHlcbiAgICBpZiggdGhpcy5fX3ZhbHVlWzBdID4gMSApIHRoaXMuX192YWx1ZVswXSA9IDFcbiAgICBpZiggdGhpcy5fX3ZhbHVlWzFdID4gMSApIHRoaXMuX192YWx1ZVsxXSA9IDFcbiAgICBpZiggdGhpcy5fX3ZhbHVlWzBdIDwgMCApIHRoaXMuX192YWx1ZVswXSA9IDBcbiAgICBpZiggdGhpcy5fX3ZhbHVlWzFdIDwgMCApIHRoaXMuX192YWx1ZVsxXSA9IDBcblxuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxufSlcblxuZXhwb3J0IGRlZmF1bHQgSm95c3RpY2tcbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5pbXBvcnQgVXRpbGl0aWVzICAgIGZyb20gJy4vdXRpbGl0aWVzLmpzJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIEtleXNcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxuY29uc3QgS2V5cyA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5jb25zdCBrZXlUeXBlc0Zvck5vdGUgPSB7XG4gIGM6ICAgICAnd1JpZ2h0JyxcbiAgJ2MjJzogICdiJyxcbiAgZGI6ICAgICdiJyxcbiAgZDogICAgICd3TWlkZGxlJyxcbiAgJ2QjJzogICdiJyxcbiAgZWI6ICAgICdiJyxcbiAgZTogICAgICd3TGVmdCcsXG4gIGY6ICAgICAnd1JpZ2h0JyxcbiAgJ2YjJzogICdiJyxcbiAgZ2I6ICAgICdiJyxcbiAgZzogICAgICd3TWlkZGxlUicsXG4gICdnIyc6ICAnYicsXG4gIGFiOiAgICAnYicsXG4gIGE6ICAgICAnd01pZGRsZUwnLFxuICAnYSMnOiAgJ2InLFxuICBiYjogICAgJ2InLFxuICBiOiAgICAgJ3dMZWZ0JyBcbn0gXG5cbmNvbnN0IG5vdGVJbnRlZ2VycyA9IFtcbiAgJ2MnLCdkYicsJ2QnLCdlYicsJ2UnLCdmJywnZ2InLCdnJywnYWInLCdhJywnYmInLCdiJ1xuXVxuXG5jb25zdCBrZXlDb2xvcnMgPSBbXG4gIDEsMCwxLDAsMSwxLDAsMSwwLDEsMCwxXG5dXG5cblxuT2JqZWN0LmFzc2lnbiggS2V5cywge1xuICAvKiogQGxlbmRzIEtleXMucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBLZXlzIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBLZXlzXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBhY3RpdmU6ICAgICBmYWxzZSxcbiAgICBzdGFydEtleTogICAzNixcbiAgICBlbmRLZXk6ICAgICA2MCxcbiAgICB3aGl0ZUNvbG9yOiAnI2ZmZicsXG4gICAgYmxhY2tDb2xvcjogJyMwMDAnLFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgS2V5cyBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEtleXNcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIEtleXMgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQga2V5cyA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggS2V5cyBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCgga2V5cyApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIFxuICAgICAga2V5cywgXG4gICAgICBLZXlzLmRlZmF1bHRzLCBcbiAgICAgIHByb3BzLCBcbiAgICAgIHsgXG4gICAgICAgIHZhbHVlOnt9LCBcbiAgICAgICAgX192YWx1ZTp7fSwgXG4gICAgICAgIGJvdW5kczpbXSwgXG4gICAgICAgIGFjdGl2ZTp7fSxcbiAgICAgICAgX19wcmV2VmFsdWU6W11cbiAgICAgIH1cbiAgICApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIGtleXMuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBrZXlzLmluaXQoKVxuXG4gICAgZm9yKCBsZXQgaSA9IGtleXMuc3RhcnRLZXk7IGkgPCBrZXlzLmVuZEtleTsgaSsrICkge1xuICAgICAga2V5cy5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgICBrZXlzLnZhbHVlWyBpIF0gPSAwXG4gICAgICBrZXlzLmJvdW5kc1sgaSBdID0gW11cbiAgICB9XG5cbiAgICBrZXlzLm9ucGxhY2UgPSAoKSA9PiBrZXlzLl9fZGVmaW5lQm91bmRzKClcblxuICAgIHJldHVybiBrZXlzXG4gIH0sXG5cbiAgX19kZWZpbmVCb3VuZHMoKSB7XG4gICAgY29uc3Qga2V5UmFuZ2UgPSB0aGlzLmVuZEtleSAtIHRoaXMuc3RhcnRLZXlcbiAgICBjb25zdCByZWN0ID0gdGhpcy5yZWN0XG4gICAgY29uc3Qga2V5V2lkdGggPSAocmVjdC53aWR0aCAvIGtleVJhbmdlKSAqIDEuNzI1XG4gICAgY29uc3QgYmxhY2tIZWlnaHQgPSAuNjUgKiByZWN0LmhlaWdodFxuXG4gICAgbGV0IGN1cnJlbnRYID0gMFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBrZXlSYW5nZTsgaSsrICkge1xuICAgICAgbGV0IGJvdW5kcyA9IHRoaXMuYm91bmRzWyB0aGlzLnN0YXJ0S2V5ICsgaSBdXG4gICAgICBsZXQgbm90ZU51bWJlciA9ICggdGhpcy5zdGFydEtleSArIGkgKSAlIDEyXG4gICAgICBsZXQgbm90ZU5hbWUgICA9IG5vdGVJbnRlZ2Vyc1sgbm90ZU51bWJlciBdXG4gICAgICBsZXQgbm90ZURyYXdUeXBlID0ga2V5VHlwZXNGb3JOb3RlWyBub3RlTmFtZSBdXG4gICAgICBcbiAgICAgIHN3aXRjaCggbm90ZURyYXdUeXBlICkge1xuICAgICAgICBjYXNlICd3UmlnaHQnOlxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjYsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC42LCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6MCB9KVxuXG4gICAgICAgICAgY3VycmVudFggKz0ga2V5V2lkdGggKiAuNlxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNiwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjYsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTowIH0pXG5cbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC40XG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICd3TWlkZGxlJzpcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuOCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjIsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjIsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcblxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoICogLjhcbiAgICAgICAgICBicmVhayBcblxuICAgICAgICBjYXNlICd3TGVmdCc6XG4gICAgICAgICAgY3VycmVudFggLT0ga2V5V2lkdGggKiAuMiBcblxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjQsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjQsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnd01pZGRsZVInOlxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICouMiwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKi4yLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAxLjEsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIDEuMSwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjcsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC43LCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqLjIsIHk6MCB9KVxuXG4gICAgICAgICAgY3VycmVudFggKz0ga2V5V2lkdGggKiAuN1xuICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgIGNhc2UgJ3dNaWRkbGVMJzpcbiAgICAgICAgICBjdXJyZW50WCAtPSBrZXlXaWR0aCAqIC4xXG5cbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuOCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjMsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjMsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC44XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEtleXMgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBLZXlzXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICBjb25zdCBjdHggID0gdGhpcy5jdHggIFxuICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuYmxhY2tDb2xvclxuICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgXG4gICAgbGV0IGNvdW50ICA9IDBcbiAgICBmb3IoIGxldCBib3VuZHMgb2YgdGhpcy5ib3VuZHMgKSB7XG4gICAgICBpZiggYm91bmRzID09PSB1bmRlZmluZWQgKSBjb250aW51ZSBcblxuICAgICAgbGV0IG5vdGVOdW1iZXIgPSAoIHRoaXMuc3RhcnRLZXkgKyBjb3VudCApICUgMTJcbiAgICAgIGxldCBub3RlTmFtZSAgID0gbm90ZUludGVnZXJzWyBub3RlTnVtYmVyIF1cbiAgICAgIGxldCBub3RlRHJhd1R5cGUgPSBrZXlUeXBlc0Zvck5vdGVbIG5vdGVOYW1lIF1cblxuICAgICAgY3R4LmJlZ2luUGF0aCgpXG5cbiAgICAgIGN0eC5tb3ZlVG8oIGJvdW5kc1swXS54LCBib3VuZHNbMF0ueSApXG5cbiAgICAgIGZvciggbGV0IGlkeCA9IDE7IGlkeCA8IGJvdW5kcy5sZW5ndGg7IGlkeCsrICkge1xuICAgICAgICBjdHgubGluZVRvKCBib3VuZHNbIGlkeCBdLngsIGJvdW5kc1sgaWR4IF0ueSApXG4gICAgICB9XG5cbiAgICAgIGN0eC5jbG9zZVBhdGgoKVxuICAgICAgXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyB0aGlzLnN0YXJ0S2V5ICsgY291bnQgXSA9PT0gMSApIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjOTk5J1xuICAgICAgfWVsc2V7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBrZXlDb2xvcnNbIG5vdGVOdW1iZXIgXSA9PT0gMSA/IHRoaXMud2hpdGVDb2xvciA6IHRoaXMuYmxhY2tDb2xvclxuICAgICAgfVxuXG4gICAgICBjdHguZmlsbCgpXG4gICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgY291bnQrK1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsIHRoaXMucG9pbnRlcmRvd24gKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICBsZXQgaGl0ID0gdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlLCAnZG93bicgKSAvLyBjaGFuZ2Uga2V5cyB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuICAgICAgaWYoIGhpdCAhPT0gbnVsbCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0gPSBoaXQgXG4gICAgICAgIC8vdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0ubGFzdEJ1dHRvbiA9IGRhdGEuYnV0dG9uTnVtXG4gICAgICB9XG5cbiAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgbGV0IGtleU51bSA9IHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdXG5cbiAgICAgIGlmKCBrZXlOdW0gIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICAgIGRlbGV0ZSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXVxuXG4gICAgICAgIHRoaXMuX192YWx1ZVsga2V5TnVtIF0gPSAwXG4gICAgICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoIGtleU51bSApXG4gICAgICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcblxuICAgICAgICAvL3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIC8vd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgLy90aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgS2V5cydzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIEtleXNcbiAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGUgLSBUaGUgcG9pbnRlciBldmVudCB0byBiZSBwcm9jZXNzZWQuXG4gICAqL1xuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlLCBkaXIgKSB7XG4gICAgbGV0IHByZXZWYWx1ZSA9IHRoaXMudmFsdWUsXG4gICAgICAgIGhpdEtleU51bSA9IG51bGwsXG4gICAgICAgIHNob3VsZERyYXcgPSBmYWxzZVxuXG4gICAgZm9yKCBsZXQgaSA9IHRoaXMuc3RhcnRLZXk7IGkgPCB0aGlzLmVuZEtleTsgaSsrICkge1xuICAgICAgbGV0IGhpdCA9IFV0aWxpdGllcy5wb2x5SGl0VGVzdCggZSwgdGhpcy5ib3VuZHNbIGkgXSwgdGhpcy5yZWN0IClcblxuICAgICAgaWYoIGhpdCA9PT0gdHJ1ZSApIHtcbiAgICAgICAgaGl0S2V5TnVtID0gaVxuICAgICAgICB0aGlzLl9fdmFsdWVbIGkgXSA9IGRpciA9PT0gJ2Rvd24nID8gMSA6IDBcbiAgICAgICAgbGV0IF9fc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KCBoaXRLZXlOdW0sIGRpciApXG5cbiAgICAgICAgaWYoIF9fc2hvdWxkRHJhdyA9PT0gdHJ1ZSApIHNob3VsZERyYXcgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuXG4gICAgcmV0dXJuIGhpdEtleU51bVxuICB9LFxuXG4gIG91dHB1dCgga2V5TnVtLCBkaXIgKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fX3ZhbHVlWyBrZXlOdW0gXSwgbmV3VmFsdWVHZW5lcmF0ZWQgPSBmYWxzZSwgcHJldlZhbHVlID0gdGhpcy5fX3ByZXZWYWx1ZVsga2V5TnVtIF1cblxuICAgIHZhbHVlID0gdGhpcy5ydW5GaWx0ZXJzKCB2YWx1ZSwgdGhpcyApXG4gICAgXG4gICAgdGhpcy52YWx1ZVsga2V5TnVtIF0gPSB2YWx1ZVxuICAgIFxuICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApIHRoaXMudHJhbnNtaXQoIFsgdmFsdWUsIGtleU51bSBdIClcblxuICAgIGlmKCBwcmV2VmFsdWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGlmKCB2YWx1ZSAhPT0gcHJldlZhbHVlICkge1xuICAgICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmKCBuZXdWYWx1ZUdlbmVyYXRlZCApIHsgXG4gICAgICBpZiggdGhpcy5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkgdGhpcy5vbnZhbHVlY2hhbmdlKCB2YWx1ZSwga2V5TnVtICkgXG4gICAgICBcbiAgICAgIHRoaXMuX19wcmV2VmFsdWVbIGtleU51bSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICAvLyBuZXdWYWx1ZUdlbmVyYXRlZCBjYW4gYmUgdXNlIHRvIGRldGVybWluZSBpZiB3aWRnZXQgc2hvdWxkIGRyYXdcbiAgICByZXR1cm4gbmV3VmFsdWVHZW5lcmF0ZWRcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlzXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIEtub2JcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IEtub2IgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggS25vYiwge1xuICAvKiogQGxlbmRzIEtub2IucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBLbm9iIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOi41LCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOi41LCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICBrbm9iQnVmZmVyOjIwLFxuICAgIHVzZXNSb3RhdGlvbjpmYWxzZSxcbiAgICBsYXN0UG9zaXRpb246MCxcbiAgICBpc1NxdWFyZTp0cnVlLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgZWl0aGVyICdob3Jpem9udGFsJyAodGhlIGRlZmF1bHQpIG9yICd2ZXJ0aWNhbCcuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgS25vYiBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgS25vYlxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAnaG9yaXpvbnRhbCdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEtub2IgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBLbm9iIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IGtub2IgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIEtub2IgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIGtub2IgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBrbm9iLCBLbm9iLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIGtub2IuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBrbm9iLmluaXQoKVxuXG4gICAgcmV0dXJuIGtub2JcbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgS25vYiBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5jb250YWluZXIuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggICA9IHRoaXMubGluZVdpZHRoXG5cbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgbGV0IHggPSAwLFxuICAgICAgICB5ID0gMCxcbiAgICAgICAgd2lkdGggPSB0aGlzLnJlY3Qud2lkdGgsXG4gICAgICAgIGhlaWdodD0gdGhpcy5yZWN0LmhlaWdodCxcbiAgICAgICAgcmFkaXVzID0gd2lkdGggLyAyXG4gICAgXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIHgsIHksIHdpZHRoLCBoZWlnaHQgKVxuICAgIC8vdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kIC8vIGRyYXcgYmFja2dyb3VuZCBvZiB3aWRnZXQgZmlyc3RcblxuICAgIGxldCBhbmdsZTAgPSBNYXRoLlBJICogLjYsXG4gICAgICAgIGFuZ2xlMSA9IE1hdGguUEkgKiAuNFxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKClcbiAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgICAgICAgICBhbmdsZTAsIGFuZ2xlMSwgZmFsc2UgKVxuICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSAsIGFuZ2xlMSwgYW5nbGUwLCB0cnVlICApXHRcdFxuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpXG4gICAgXG4gICAgdGhpcy5jdHguZmlsbCgpXG5cbiAgICBsZXQgYW5nbGUyXG4gICAgaWYoIXRoaXMuaXNJbnZlcnRlZCkgIHsgXG4gICAgICBhbmdsZTIgPSBNYXRoLlBJICogLjYgKyB0aGlzLl9fdmFsdWUgKiAxLjggICogTWF0aC5QSVxuICAgICAgaWYoIGFuZ2xlMiA+IDIgKiBNYXRoLlBJKSBhbmdsZTIgLT0gMiAqIE1hdGguUElcbiAgICB9ZWxzZXtcbiAgICAgIGFuZ2xlMiA9IE1hdGguUEkgKiAoMC40IC0gKDEuOCAqIHRoaXMuX192YWx1ZSkpXG4gICAgfVxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKClcblxuICAgIGlmKCF0aGlzLmlzSW52ZXJ0ZWQpIHtcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgcmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyLCBhbmdsZTAsIGFuZ2xlMiwgZmFsc2UgKVxuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41LCBhbmdsZTIsIGFuZ2xlMCwgdHJ1ZSApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgcmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyLCBhbmdsZTEsIGFuZ2xlMiAsdHJ1ZSApXG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUsIGFuZ2xlMiwgYW5nbGUxLCBmYWxzZSApXG4gICAgfVxuXG4gICAgdGhpcy5jdHguY2xvc2VQYXRoKClcblxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuICAgIHRoaXMuY3R4LmZpbGwoKVxuICBcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSAvLyBjaGFuZ2Uga25vYiB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgS25vYidzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGUgLSBUaGUgcG9pbnRlciBldmVudCB0byBiZSBwcm9jZXNzZWQuXG4gICAqL1xuXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IHhPZmZzZXQgPSBlLmNsaWVudFgsIHlPZmZzZXQgPSBlLmNsaWVudFlcblxuICAgIGxldCByYWRpdXMgPSB0aGlzLnJlY3Qud2lkdGggLyAyO1xuICAgIHRoaXMubGFzdFZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIGlmKCAhdGhpcy51c2VzUm90YXRpb24gKSB7XG4gICAgICBpZiggdGhpcy5sYXN0UG9zaXRpb24gIT09IC0xICkgeyBcbiAgICAgICAgLy90aGlzLl9fdmFsdWUgLT0gKCB5T2Zmc2V0IC0gdGhpcy5sYXN0UG9zaXRpb24gKSAvIChyYWRpdXMgKiAyKTtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMSAtIHlPZmZzZXQgLyB0aGlzLnJlY3QuaGVpZ2h0XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICB2YXIgeGRpZmYgPSByYWRpdXMgLSB4T2Zmc2V0O1xuICAgICAgdmFyIHlkaWZmID0gcmFkaXVzIC0geU9mZnNldDtcbiAgICAgIHZhciBhbmdsZSA9IE1hdGguUEkgKyBNYXRoLmF0YW4yKHlkaWZmLCB4ZGlmZik7XG4gICAgICB0aGlzLl9fdmFsdWUgPSAgKChhbmdsZSArIChNYXRoLlBJICogMS41KSkgJSAoTWF0aC5QSSAqIDIpKSAvIChNYXRoLlBJICogMik7XG5cbiAgICAgIGlmKHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPiAuOCAmJiB0aGlzLl9fdmFsdWUgPCAuMikge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxO1xuICAgICAgfWVsc2UgaWYodGhpcy5sYXN0Um90YXRpb25WYWx1ZSA8IC4yICYmIHRoaXMuX192YWx1ZSA+IC44KSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX192YWx1ZSA+IDEpIHRoaXMuX192YWx1ZSA9IDE7XG4gICAgaWYgKHRoaXMuX192YWx1ZSA8IDApIHRoaXMuX192YWx1ZSA9IDA7XG5cbiAgICB0aGlzLmxhc3RSb3RhdGlvblZhbHVlID0gdGhpcy5fX3ZhbHVlO1xuICAgIHRoaXMubGFzdFBvc2l0aW9uID0geU9mZnNldDtcblxuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxuICAvL19fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gIC8vICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgLy8gIGlmKCB0eXBlb2YgdGhpcy5hZGRFdmVudHMgPT09ICdmdW5jdGlvbicgKSB0aGlzLmFkZEV2ZW50cygpXG5cbiAgLy8gIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgXG4gIC8vICB0aGlzLnBsYWNlKCB0cnVlICkgXG5cbiAgLy8gIGlmKCB0aGlzLmxhYmVsICkgdGhpcy5hZGRMYWJlbCgpXG5cbiAgLy8gIHRoaXMuZHJhdygpICAgICBcblxuICAvL31cblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBLbm9iXG4iLCJpbXBvcnQgRE9NV2lkZ2V0IGZyb20gJy4vZG9tV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgSFRNTCBzZWxlY3QgZWxlbWVudCwgZm9yIHBpY2tpbmcgaXRlbXMgZnJvbSBhIGRyb3AtZG93biBtZW51LiBcbiAqIFxuICogQG1vZHVsZSBNZW51XG4gKiBAYXVnbWVudHMgRE9NV2lkZ2V0XG4gKi8gXG5sZXQgTWVudSA9IE9iamVjdC5jcmVhdGUoIERPTVdpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBNZW51LCB7XG4gIC8qKiBAbGVuZHMgTWVudS5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIE1lbnUgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIE1lbnVcbiAgICogQHN0YXRpY1xuICAgKi8gXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTowLFxuICAgIHZhbHVlOjAsXG4gICAgYmFja2dyb3VuZDonIzMzMycsXG4gICAgZmlsbDonIzc3NycsXG4gICAgc3Ryb2tlOicjYWFhJyxcbiAgICBib3JkZXJXaWR0aDo0LFxuXG4gIC8qKlxuICAgKiBUaGUgb3B0aW9ucyBhcnJheSBzdG9yZXMgdGhlIGRpZmZlcmVudCBwb3NzaWJsZSB2YWx1ZXMgZm9yIHRoZSBNZW51XG4gICAqIHdpZGdldC4gVGhlcmUgYXJlIHVzZWQgdG8gY3JlYXRlIEhUTUwgb3B0aW9uIGVsZW1lbnRzIHdoaWNoIGFyZSB0aGVuXG4gICAqIGF0dGFjaGVkIHRvIHRoZSBwcmltYXJ5IHNlbGVjdCBlbGVtZW50IHVzZWQgYnkgdGhlIE1lbnUuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBpbnN0YW5jZVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqLyBcbiAgICBvcHRpb25zOltdLFxuICAgIG9udmFsdWVjaGFuZ2U6bnVsbFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgTWVudSBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIE1lbnVcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIGEgTWVudSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBtZW51ID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgRE9NV2lkZ2V0LmNyZWF0ZS5jYWxsKCBtZW51IClcblxuICAgIE9iamVjdC5hc3NpZ24oIG1lbnUsIE1lbnUuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIG1lbnUuY3JlYXRlT3B0aW9ucygpXG5cbiAgICBtZW51LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICggZSApPT4ge1xuICAgICAgbWVudS5fX3ZhbHVlID0gZS50YXJnZXQudmFsdWVcbiAgICAgIG1lbnUub3V0cHV0KClcblxuICAgICAgaWYoIG1lbnUub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHtcbiAgICAgICAgbWVudS5vbnZhbHVlY2hhbmdlKCBtZW51LnZhbHVlICApXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBtZW51XG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBwcmltYXJ5IERPTSBlbGVtZW50IChzZWxlY3QpIHRvIGJlIHBsYWNlZCBpbiBhIFBhbmVsLlxuICAgKiBAbWVtYmVyb2YgTWVudSBcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBjcmVhdGVFbGVtZW50KCkge1xuICAgIGxldCBzZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2VsZWN0JyApXG5cbiAgICByZXR1cm4gc2VsZWN0XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIG9wdGlvbiBlbGVtZW50cyBmb3IgbWVudS4gUmVtb3ZlcyBwcmV2aW91c2x5IGFwcGVuZGVkIGVsZW1lbnRzLlxuICAgKiBAbWVtYmVyb2YgTWVudSBcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBjcmVhdGVPcHRpb25zKCkge1xuICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSAnJ1xuXG4gICAgZm9yKCBsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucyApIHtcbiAgICAgIGxldCBvcHRpb25FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdvcHRpb24nIClcbiAgICAgIG9wdGlvbkVsLnNldEF0dHJpYnV0ZSggJ3ZhbHVlJywgb3B0aW9uIClcbiAgICAgIG9wdGlvbkVsLmlubmVyVGV4dCA9IG9wdGlvblxuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCBvcHRpb25FbCApXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBPdmVycmlkZGVuIHZpcnR1YWwgbWV0aG9kIHRvIGFkZCBlbGVtZW50IHRvIHBhbmVsLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAbWVtYmVyb2YgTWVudSBcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBfX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAgIHRoaXMuY29udGFpbmVyID0gcGFuZWxcblxuICAgIGlmKCB0eXBlb2YgdGhpcy5hZGRFdmVudHMgPT09ICdmdW5jdGlvbicgKSB0aGlzLmFkZEV2ZW50cygpXG5cbiAgICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIHRoaXMucGxhY2UoKSBcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBNZW51XG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0J1xuXG4vKipcbiAqIEEgTXVsdGlCdXR0b24gd2l0aCB0aHJlZSBkaWZmZXJlbnQgc3R5bGVzOiAnbW9tZW50YXJ5JyB0cmlnZ2VycyBhIGZsYXNoIGFuZCBpbnN0YW5lb3VzIG91dHB1dCwgXG4gKiAnaG9sZCcgb3V0cHV0cyB0aGUgbXVsdGlCdXR0b25zIG1heGltdW0gdmFsdWUgdW50aWwgaXQgaXMgcmVsZWFzZWQsIGFuZCAndG9nZ2xlJyBhbHRlcm5hdGVzIFxuICogYmV0d2VlbiBvdXRwdXR0aW5nIG1heGltdW0gYW5kIG1pbmltdW0gdmFsdWVzIG9uIHByZXNzLiBcbiAqIFxuICogQG1vZHVsZSBNdWx0aUJ1dHRvblxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgTXVsdGlCdXR0b24gPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBNdWx0aUJ1dHRvbiwge1xuXG4gIC8qKiBAbGVuZHMgTXVsdGlCdXR0b24ucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBNdWx0aUJ1dHRvbiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlCdXR0b25cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIHJvd3M6MixcbiAgICBjb2x1bW5zOjIsXG4gICAgbGFzdEJ1dHRvbjpudWxsLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgJ21vbWVudGFyeScsICdob2xkJywgb3IgJ3RvZ2dsZScuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBpbnRlcmFjdGlvbiBvZiB0aGUgTXVsdGlCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICd0b2dnbGUnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNdWx0aUJ1dHRvbiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIE11bHRpQnV0dG9uIGluc3RhbmNlIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG11bHRpQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBtdWx0aUJ1dHRvbiApXG5cbiAgICBPYmplY3QuYXNzaWduKCBtdWx0aUJ1dHRvbiwgTXVsdGlCdXR0b24uZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy52YWx1ZSApIHtcbiAgICAgIG11bHRpQnV0dG9uLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIH1lbHNle1xuICAgICAgbXVsdGlCdXR0b24uX192YWx1ZSA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IG11bHRpQnV0dG9uLmNvdW50OyBpKysgKSBtdWx0aUJ1dHRvbi5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgICBtdWx0aUJ1dHRvbi52YWx1ZSA9IFtdXG4gICAgfVxuICAgIFxuICAgIG11bHRpQnV0dG9uLmFjdGl2ZSA9IHt9XG4gICAgbXVsdGlCdXR0b24uX19wcmV2VmFsdWUgPSBbXVxuXG4gICAgbXVsdGlCdXR0b24uaW5pdCgpXG5cbiAgICByZXR1cm4gbXVsdGlCdXR0b25cbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgTXVsdGlCdXR0b24gaW50byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkgYW5kIG11bHRpQnV0dG9uIHN0eWxlLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlCdXR0b25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5fX3ZhbHVlID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG5cbiAgICBsZXQgYnV0dG9uV2lkdGggID0gdGhpcy5yZWN0LndpZHRoICAvIHRoaXMuY29sdW1ucywgIFxuICAgICAgICBidXR0b25IZWlnaHQgPSB0aGlzLnJlY3QuaGVpZ2h0IC8gdGhpcy5yb3dzXG5cbiAgICBmb3IoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnJvd3M7IHJvdysrICkge1xuICAgICAgbGV0IHkgPSByb3cgKiBidXR0b25IZWlnaHRcbiAgICAgIGZvciggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHRoaXMuY29sdW1uczsgY29sdW1uKysgKSB7XG4gICAgICAgIGxldCB4ID0gY29sdW1uICogYnV0dG9uV2lkdGgsXG4gICAgICAgICAgICBidXR0b25OdW0gPSByb3cgKiB0aGlzLmNvbHVtbnMgKyBjb2x1bW5cblxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LHksIGJ1dHRvbldpZHRoLCBidXR0b25IZWlnaHQgKVxuICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCB4LHksIGJ1dHRvbldpZHRoLCBidXR0b25IZWlnaHQgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZ2V0RGF0YUZyb21FdmVudCggZSApIHtcbiAgICBsZXQgcm93U2l6ZSA9IDEvdGhpcy5yb3dzLFxuICAgICAgICByb3cgPSAgTWF0aC5mbG9vciggKCBlLmNsaWVudFkgLyB0aGlzLnJlY3QuaGVpZ2h0ICkgLyByb3dTaXplICksXG4gICAgICAgIGNvbHVtblNpemUgPSAxL3RoaXMuY29sdW1ucyxcbiAgICAgICAgY29sdW1uID0gIE1hdGguZmxvb3IoICggZS5jbGllbnRYIC8gdGhpcy5yZWN0LndpZHRoICkgLyBjb2x1bW5TaXplICksXG4gICAgICAgIGJ1dHRvbk51bSA9IHJvdyAqIHRoaXMuY29sdW1ucyArIGNvbHVtblxuXG4gICAgIHJldHVybiB7IGJ1dHRvbk51bSwgcm93LCBjb2x1bW4gfVxuICB9LFxuXG4gIHByb2Nlc3NCdXR0b25PbiggZGF0YSwgZSApIHtcbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ3RvZ2dsZScgKSB7XG4gICAgICB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID0gdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9PT0gMSA/IDAgOiAxXG4gICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdtb21lbnRhcnknICkge1xuICAgICAgdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9IDFcbiAgICAgIHNldFRpbWVvdXQoICgpPT4geyBcbiAgICAgICAgdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9IDA7XG4gICAgICAgIC8vbGV0IGlkeCA9IHRoaXMuYWN0aXZlLmZpbmRJbmRleCggdiA9PiB2LmJ1dHRvbk51bSA9PT0gYnV0dG9uTnVtIClcbiAgICAgICAgLy90aGlzLmFjdGl2ZS5zcGxpY2UoIGlkeCwgMSApXG4gICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLnNwbGljZSggdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0uaW5kZXhPZiggYnV0dG9uTnVtICksIDEgKVxuICAgICAgICB0aGlzLmRyYXcoKSBcbiAgICAgIH0sIDUwIClcbiAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgdGhpcy5fX3ZhbHVlWyBkYXRhLmJ1dHRvbk51bSBdID0gMVxuICAgIH1cblxuICAgIHRoaXMub3V0cHV0KCBkYXRhIClcblxuICAgIHRoaXMuZHJhdygpXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICAvLyBvbmx5IGhvbGQgbmVlZHMgdG8gbGlzdGVuIGZvciBwb2ludGVydXAgZXZlbnRzOyB0b2dnbGUgYW5kIG1vbWVudGFyeSBvbmx5IGNhcmUgYWJvdXQgcG9pbnRlcmRvd25cbiAgICAgIGxldCBkYXRhID0gdGhpcy5nZXREYXRhRnJvbUV2ZW50KCBlIClcblxuICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0gPSBbIGRhdGEuYnV0dG9uTnVtIF1cbiAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmxhc3RCdXR0b24gPSBkYXRhLmJ1dHRvbk51bVxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCB0aGlzLnBvaW50ZXJ1cCApIFxuXG4gICAgICB0aGlzLnByb2Nlc3NCdXR0b25PbiggZGF0YSwgZSApXG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgbGV0IGRhdGEgPSB0aGlzLmdldERhdGFGcm9tRXZlbnQoIGUgKVxuICAgICAgXG4gICAgICBsZXQgY2hlY2tGb3JQcmVzc2VkID0gdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0uaW5kZXhPZiggZGF0YS5idXR0b25OdW0gKSxcbiAgICAgICAgICBsYXN0QnV0dG9uICA9IHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmxhc3RCdXR0b25cbiAgICAgIFxuICAgICAgaWYoIGNoZWNrRm9yUHJlc3NlZCA9PT0gLTEgJiYgbGFzdEJ1dHRvbiAhPT0gZGF0YS5idXR0b25OdW0gKSB7XG4gICAgICAgIFxuICAgICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ3RvZ2dsZScgfHwgdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgICAgICB0aGlzLl9fdmFsdWVbIGxhc3RCdXR0b24gXSA9IDBcbiAgICAgICAgICAgIHRoaXMub3V0cHV0KCBkYXRhIClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0gPSBbIGRhdGEuYnV0dG9uTnVtIF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0ucHVzaCggZGF0YS5idXR0b25OdW0gKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0ubGFzdEJ1dHRvbiA9IGRhdGEuYnV0dG9uTnVtXG5cbiAgICAgICAgdGhpcy5wcm9jZXNzQnV0dG9uT24oIGRhdGEsIGUgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggT2JqZWN0LmtleXMoIHRoaXMuYWN0aXZlICkubGVuZ3RoICkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApXG5cbiAgICAgICAgaWYoIHRoaXMuc3R5bGUgIT09ICd0b2dnbGUnICkge1xuICAgICAgICAgIGxldCBidXR0b25zRm9yUG9pbnRlciA9IHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdXG5cbiAgICAgICAgICBpZiggYnV0dG9uc0ZvclBvaW50ZXIgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGZvciggbGV0IGJ1dHRvbiBvZiBidXR0b25zRm9yUG9pbnRlciApIHtcbiAgICAgICAgICAgICAgdGhpcy5fX3ZhbHVlWyBidXR0b24gXSA9IDBcbiAgICAgICAgICAgICAgbGV0IHJvdyA9IE1hdGguZmxvb3IoIGJ1dHRvbiAvIHRoaXMucm93cyApLFxuICAgICAgICAgICAgICAgICAgY29sdW1uID0gYnV0dG9uICUgdGhpcy5jb2x1bW5zXG5cbiAgICAgICAgICAgICAgdGhpcy5vdXRwdXQoeyBidXR0b25OdW06YnV0dG9uLCByb3csIGNvbHVtbiB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZHJhdygpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG91dHB1dCggYnV0dG9uRGF0YSApIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9fdmFsdWVbIGJ1dHRvbkRhdGEuYnV0dG9uTnVtIF0sIG5ld1ZhbHVlR2VuZXJhdGVkID0gZmFsc2UsIHByZXZWYWx1ZSA9IHRoaXMuX19wcmV2VmFsdWVbIGJ1dHRvbkRhdGEuYnV0dG9uTnVtIF1cblxuICAgIHZhbHVlID0gdGhpcy5ydW5GaWx0ZXJzKCB2YWx1ZSwgdGhpcyApXG4gICAgXG4gICAgdGhpcy52YWx1ZVsgYnV0dG9uRGF0YS5idXR0b25OdW0gXSA9IHZhbHVlXG4gICAgXG4gICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICkgdGhpcy50cmFuc21pdCggWyB2YWx1ZSwgYnV0dG9uRGF0YS5yb3csIGJ1dHRvbkRhdGEuY29sdW1uIF0gKVxuXG4gICAgaWYoIHByZXZWYWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgaWYoIHZhbHVlICE9PSBwcmV2VmFsdWUgKSB7XG4gICAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYoIG5ld1ZhbHVlR2VuZXJhdGVkICkgeyBcbiAgICAgIGlmKCB0aGlzLm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB0aGlzLm9udmFsdWVjaGFuZ2UoIHZhbHVlLCBidXR0b25EYXRhLnJvdywgYnV0dG9uRGF0YS5jb2x1bW4gKVxuICAgICAgXG4gICAgICB0aGlzLl9fcHJldlZhbHVlWyBidXR0b25EYXRhLmJ1dHRvbk51bSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICAvLyBuZXdWYWx1ZUdlbmVyYXRlZCBjYW4gYmUgdXNlIHRvIGRldGVybWluZSBpZiB3aWRnZXQgc2hvdWxkIGRyYXdcbiAgICByZXR1cm4gbmV3VmFsdWVHZW5lcmF0ZWRcbiAgfSxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IE11bHRpQnV0dG9uXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIE11bHRpU2xpZGVyXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBNdWx0aVNsaWRlciA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBNdWx0aVNsaWRlciwge1xuICAvKiogQGxlbmRzIE11bHRpU2xpZGVyLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgTXVsdGlTbGlkZXIgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOlsuMTUsLjM1LC41LC43NV0sIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6Wy41LC41LC41LC41XSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgLyoqXG4gICAgICogVGhlIGNvdW50IHByb3BlcnR5IGRldGVybWluZXMgdGhlIG51bWJlciBvZiBzbGlkZXJzIGluIHRoZSBtdWx0aXNsaWRlciwgZGVmYXVsdCA0LlxuICAgICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtJbnRlZ2VyfVxuICAgICAqL1xuICAgIGNvdW50OjQsXG4gICAgbGluZVdpZHRoOjEsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSBlaXRoZXIgJ2hvcml6b250YWwnICh0aGUgZGVmYXVsdCkgb3IgJ3ZlcnRpY2FsJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBNdWx0aVNsaWRlciBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOid2ZXJ0aWNhbCdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IE11bHRpU2xpZGVyIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIE11bHRpU2xpZGVyIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG11bHRpU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBNdWx0aVNsaWRlciBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggbXVsdGlTbGlkZXIgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBtdWx0aVNsaWRlciwgTXVsdGlTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkgbXVsdGlTbGlkZXIuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBtdWx0aVNsaWRlci5pbml0KClcbiAgICBcbiAgICBpZiggcHJvcHMudmFsdWUgPT09IHVuZGVmaW5lZCAmJiBtdWx0aVNsaWRlci5jb3VudCAhPT0gNCApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbXVsdGlTbGlkZXIuY291bnQ7IGkrKyApIHtcbiAgICAgICAgbXVsdGlTbGlkZXIuX192YWx1ZVsgaSBdID0gaSAvIG11bHRpU2xpZGVyLmNvdW50XG4gICAgICB9XG4gICAgfWVsc2UgaWYoIHR5cGVvZiBwcm9wcy52YWx1ZSA9PT0gJ251bWJlcicgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IG11bHRpU2xpZGVyLmNvdW50OyBpKysgKSBtdWx0aVNsaWRlci5fX3ZhbHVlWyBpIF0gPSBwcm9wcy52YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBtdWx0aVNsaWRlclxuICB9LFxuICBcblxuICAvKipcbiAgICogRHJhdyB0aGUgTXVsdGlTbGlkZXIgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChtdWx0aVNsaWRlciB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGxldCBzbGlkZXJXaWR0aCA9IHRoaXMuc3R5bGUgPT09ICd2ZXJ0aWNhbCcgPyB0aGlzLnJlY3Qud2lkdGggLyB0aGlzLmNvdW50IDogdGhpcy5yZWN0LmhlaWdodCAvIHRoaXMuY291bnRcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuICAgICAgXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgICAgICBsZXQgeXBvcyA9IE1hdGguZmxvb3IoIGkgKiBzbGlkZXJXaWR0aCApXG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCB5cG9zLCB0aGlzLnJlY3Qud2lkdGggKiB0aGlzLl9fdmFsdWVbIGkgXSwgTWF0aC5jZWlsKCBzbGlkZXJXaWR0aCApIClcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwgeXBvcywgdGhpcy5yZWN0LndpZHRoLCBzbGlkZXJXaWR0aCApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbGV0IHhwb3MgPSBNYXRoLmZsb29yKCBpICogc2xpZGVyV2lkdGggKVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCggeHBvcywgdGhpcy5yZWN0LmhlaWdodCAtIHRoaXMuX192YWx1ZVsgaSBdICogdGhpcy5yZWN0LmhlaWdodCwgTWF0aC5jZWlsKHNsaWRlcldpZHRoKSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsgaSBdIClcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggeHBvcywgMCwgc2xpZGVyV2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICAgICAgfVxuICAgIH1cblxuICAgXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIG11bHRpU2xpZGVyIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBNdWx0aVNsaWRlcidzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZSxcbiAgICAgICAgc2xpZGVyTnVtXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgICAgc2xpZGVyTnVtID0gTWF0aC5mbG9vciggKCBlLmNsaWVudFkgLyB0aGlzLnJlY3QuaGVpZ2h0ICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAgIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICB9ZWxzZXtcbiAgICAgIHNsaWRlck51bSA9IE1hdGguZmxvb3IoICggZS5jbGllbnRYIC8gdGhpcy5yZWN0LndpZHRoICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAgIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAxIC0gKCBlLmNsaWVudFkgLSB0aGlzLnJlY3QudG9wICApIC8gdGhpcy5yZWN0LmhlaWdodCBcbiAgICB9XG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyAgKSB7XG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPiAxICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAxXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPCAwICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgfVxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpU2xpZGVyXG4iLCJsZXQgUGFuZWwgPSB7XG4gIGRlZmF1bHRzOiB7XG4gICAgZnVsbHNjcmVlbjpmYWxzZSxcbiAgICBiYWNrZ3JvdW5kOicjMzMzJ1xuICB9LFxuICBcbiAgLy8gY2xhc3MgdmFyaWFibGUgZm9yIHJlZmVyZW5jZSB0byBhbGwgcGFuZWxzXG4gIHBhbmVsczpbXSxcblxuICBjcmVhdGUoIHByb3BzID0gbnVsbCApIHtcbiAgICBsZXQgcGFuZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBkZWZhdWx0OiBmdWxsIHdpbmRvdyBpbnRlcmZhY2VcbiAgICBpZiggcHJvcHMgPT09IG51bGwgKSB7XG4gICAgICAgIFxuICAgICAgT2JqZWN0LmFzc2lnbiggcGFuZWwsIFBhbmVsLmRlZmF1bHRzLCB7XG4gICAgICAgIHg6MCxcbiAgICAgICAgeTowLFxuICAgICAgICB3aWR0aDoxLFxuICAgICAgICBoZWlnaHQ6MSxcbiAgICAgICAgX194OiAwLFxuICAgICAgICBfX3k6IDAsXG4gICAgICAgIF9fd2lkdGg6IG51bGwsXG4gICAgICAgIF9faGVpZ2h0Om51bGwsXG4gICAgICAgIGZ1bGxzY3JlZW46IHRydWUsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgcGFuZWwuZGl2ID0gcGFuZWwuX19jcmVhdGVIVE1MRWxlbWVudCgpXG4gICAgICBwYW5lbC5sYXlvdXQoKVxuXG4gICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdib2R5JyApXG4gICAgICBib2R5LmFwcGVuZENoaWxkKCBwYW5lbC5kaXYgKVxuICAgIH1cbiAgICBcbiAgICBQYW5lbC5wYW5lbHMucHVzaCggcGFuZWwgKVxuXG4gICAgcmV0dXJuIHBhbmVsXG4gIH0sXG4gIFxuICBfX2NyZWF0ZUhUTUxFbGVtZW50KCkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBkaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgXG4gICAgcmV0dXJuIGRpdlxuICB9LFxuXG4gIGxheW91dCgpIHtcbiAgICBpZiggdGhpcy5mdWxsc2NyZWVuICkge1xuICAgICAgdGhpcy5fX3dpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICB0aGlzLl9faGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICB0aGlzLl9feCAgICAgID0gdGhpcy54ICogdGhpcy5fX3dpZHRoXG4gICAgICB0aGlzLl9feSAgICAgID0gdGhpcy55ICogdGhpcy5fX2hlaWdodFxuXG4gICAgICB0aGlzLmRpdi5zdHlsZS53aWR0aCAgPSB0aGlzLl9fd2lkdGggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLl9faGVpZ2h0ICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCAgID0gdGhpcy5fX3ggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS50b3AgICAgPSB0aGlzLl9feSArICdweCdcbiAgICB9XG4gIH0sXG5cbiAgZ2V0V2lkdGgoKSAgeyByZXR1cm4gdGhpcy5fX3dpZHRoICB9LFxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLl9faGVpZ2h0IH0sXG5cbiAgYWRkKCAuLi53aWRnZXRzICkge1xuICAgIGZvciggbGV0IHdpZGdldCBvZiB3aWRnZXRzICkge1xuXG4gICAgICAvLyBjaGVjayB0byBtYWtlIHN1cmUgd2lkZ2V0IGhhcyBub3QgYmVlbiBhbHJlYWR5IGFkZGVkXG4gICAgICBpZiggdGhpcy5jaGlsZHJlbi5pbmRleE9mKCB3aWRnZXQgKSA9PT0gLTEgKSB7XG4gICAgICAgIGlmKCB0eXBlb2Ygd2lkZ2V0Ll9fYWRkVG9QYW5lbCA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZCggd2lkZ2V0LmVsZW1lbnQgKVxuICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggd2lkZ2V0IClcblxuICAgICAgICAgIHdpZGdldC5fX2FkZFRvUGFuZWwoIHRoaXMgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBjYW5ub3QgYmUgYWRkZWQgdG8gcGFuZWw7IGl0IGRvZXMgbm90IGNvbnRhaW4gdGhlIG1ldGhvZCAuX19hZGRUb1BhbmVsJyApXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBpcyBhbHJlYWR5IGFkZGVkIHRvIHBhbmVsLicgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBQYW5lbCBcbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgU2xpZGVyXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggU2xpZGVyLCB7XG4gIC8qKiBAbGVuZHMgU2xpZGVyLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgU2xpZGVyIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgZWl0aGVyICdob3Jpem9udGFsJyAodGhlIGRlZmF1bHQpIG9yICd2ZXJ0aWNhbCcuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgU2xpZGVyIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ2hvcml6b250YWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBTbGlkZXIgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIFNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBzbGlkZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIFNsaWRlciBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggc2xpZGVyIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggc2xpZGVyLCBTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkgc2xpZGVyLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAgc2xpZGVyLmluaXQoKVxuXG4gICAgcmV0dXJuIHNsaWRlclxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBTbGlkZXIgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAoc2xpZGVyIHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgMCwgdGhpcy5yZWN0LndpZHRoICogdGhpcy5fX3ZhbHVlLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgICBlbHNlXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgdGhpcy5yZWN0LmhlaWdodCAtIHRoaXMuX192YWx1ZSAqIHRoaXMucmVjdC5oZWlnaHQsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZSApXG5cbiAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIHNsaWRlciB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgU2xpZGVyJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZVxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgIHRoaXMuX192YWx1ZSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIH1lbHNle1xuICAgICAgdGhpcy5fX3ZhbHVlID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgfVxuXG4gICAgLy8gY2xhbXAgX192YWx1ZSwgd2hpY2ggaXMgb25seSB1c2VkIGludGVybmFsbHlcbiAgICBpZiggdGhpcy5fX3ZhbHVlID4gMSApIHRoaXMuX192YWx1ZSA9IDFcbiAgICBpZiggdGhpcy5fX3ZhbHVlIDwgMCApIHRoaXMuX192YWx1ZSA9IDBcblxuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTbGlkZXJcbiIsImxldCBVdGlsaXRpZXMgPSB7XG5cbiAgZ2V0TW9kZSgpIHtcbiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gJ3RvdWNoJyA6ICdtb3VzZSdcbiAgfSxcbiAgXG4gIGNvbXBhcmVBcnJheXMoIGExLCBhMiApIHtcbiAgICByZXR1cm4gYTEubGVuZ3RoID09PSBhMi5sZW5ndGggJiYgYTEuZXZlcnkoKHYsaSk9PiB2ID09PSBhMltpXSlcbiAgfSxcblxuXG4gIC8vIHBvcnRlZC9hZGFwdGVkIGZyb20gb3JpZ25hbCBJbnRlcmZhY2UuanMgQnV0dG9uViBjb2RlIGJ5IEpvbmF0aGFuIFNpbW96YXJcbiAgcG9seUhpdFRlc3QoIGUsIGJvdW5kcywgcmVjdCApIHtcbiAgICBjb25zdCB3ID0gcmVjdC53aWR0aCxcbiAgICAgICAgICBoID0gcmVjdC5oZWlnaHQsXG4gICAgICAgICAgcCA9IGJvdW5kc1xuXG4gICAgbGV0IHNpZGVzID0gMCxcbiAgICAgICAgaGl0ID0gZmFsc2VcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcC5sZW5ndGggLSAxOyBpKysgKSB7XG4gICAgICBpZiggcFsgaSsxIF0ueCA+IHBbIGkgXS54ICkge1xuICAgICAgICBpZiggKCBwWyBpIF0ueCAgPD0gZS54ICkgJiYgKCBlLnggPCAgcFtpKzFdLnggKSApIHtcbiAgICAgICAgICBsZXQgeXZhbCA9ICggcFtpKzFdLnkgLSBwW2ldLnkgKS8gKCBwW2krMV0ueCAtIHBbaV0ueCApICogaC93ICogKCBlLnggLSBwW2ldLnggKSArIHBbaV0ueVxuXG4gICAgICAgICAgaWYoIHl2YWwgLSBlLnkgPCAwICkgc2lkZXMrK1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIHBbaSsxXS54IDwgcFtpXS54ICkge1xuICAgICAgICBpZiggKCBwW2ldLnggPj0gZS54ICkgJiYgKCBlLnggPiBwW2krMV0ueCApICkge1xuICAgICAgICAgIGxldCB5dmFsID0gKCBwW2krMV0ueSAtIHBbaV0ueSkgLyAoIHBbaSsxXS54IC0gcFtpXS54KSAqIGgvdyAqICggZS54IC0gcFtpXS54ICkgKyBwW2ldLnlcblxuICAgICAgICAgIGlmKCB5dmFsIC0gZS55IDwgMCApIHNpZGVzKytcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBzaWRlcyAlIDIgPT09IDEgKSBoaXQgPSB0cnVlXG4gXG4gICAgcmV0dXJuIGhpdFxuICB9LFxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdGllc1xuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSAnLi9maWx0ZXJzJ1xuaW1wb3J0IENvbW11bmljYXRpb24gZnJvbSAnLi9jb21tdW5pY2F0aW9uLmpzJ1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcblxuLyoqXG4gKiBXaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgdGhhdCBhbGwgb3RoZXIgVUkgZWxlbWVudHMgaW5oZXJpdHMgZnJvbS4gSXQgcHJpbWFyaWx5XG4gKiBpbmNsdWRlcyBtZXRob2RzIGZvciBmaWx0ZXJpbmcgLyBzY2FsaW5nIG91dHB1dC5cbiAqIEBtb2R1bGUgV2lkZ2V0XG4gKi9cblxuXG5sZXQgV2lkZ2V0ID0ge1xuICAvKiogQGxlbmRzIFdpZGdldC5wcm90b3R5cGUgKi9cbiAgXG4gIC8qKlxuICAgKiBzdG9yZSBhbGwgaW5zdGFudGlhdGVkIHdpZGdldHMuXG4gICAqIEB0eXBlIHtBcnJheS48V2lkZ2V0Pn1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICB3aWRnZXRzOiBbXSxcbiAgbGFzdFZhbHVlOiBudWxsLFxuICBvbnZhbHVlY2hhbmdlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgd2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgbWluOjAsIG1heDoxLFxuICAgIHNjYWxlT3V0cHV0OnRydWUsIC8vIGFwcGx5IHNjYWxlIGZpbHRlciBieSBkZWZhdWx0IGZvciBtaW4gLyBtYXggcmFuZ2VzXG4gICAgdGFyZ2V0Om51bGwsXG4gICAgX19wcmV2VmFsdWU6bnVsbFxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBXaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgV2lkZ2V0LmRlZmF1bHRzIClcbiAgICBcbiAgICAvKiogXG4gICAgICogU3RvcmVzIGZpbHRlcnMgZm9yIHRyYW5zZm9ybWluZyB3aWRnZXQgb3V0cHV0LlxuICAgICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmZpbHRlcnMgPSBbXVxuXG4gICAgdGhpcy5fX3ByZWZpbHRlcnMgPSBbXVxuICAgIHRoaXMuX19wb3N0ZmlsdGVycyA9IFtdXG5cbiAgICBXaWRnZXQud2lkZ2V0cy5wdXNoKCB0aGlzIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBmb3Igd2lkZ2V0cy4gQ2hlY2tzIHRvIHNlZSBpZiB3aWRnZXQgY29udGFpbnNcbiAgICogYSAndGFyZ2V0JyBwcm9wZXJ0eTsgaWYgc28sIG1ha2VzIHN1cmUgdGhhdCBjb21tdW5pY2F0aW9uIHdpdGggdGhhdFxuICAgKiB0YXJnZXQgaXMgaW5pdGlhbGl6ZWQuXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuXG4gIGluaXQoKSB7XG4gICAgaWYoIHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0ID09PSAnb3NjJyB8fCB0aGlzLnRhcmdldCA9PT0gJ21pZGknICkge1xuICAgICAgaWYoICFDb21tdW5pY2F0aW9uLmluaXRpYWxpemVkICkgQ29tbXVuaWNhdGlvbi5pbml0KClcbiAgICB9XG5cbiAgICAvLyBpZiBtaW4vbWF4IGFyZSBub3QgMC0xIGFuZCBzY2FsaW5nIGlzIG5vdCBkaXNhYmxlZFxuICAgIGlmKCB0aGlzLnNjYWxlT3V0cHV0ICYmICh0aGlzLm1pbiAhPT0gMCB8fCB0aGlzLm1heCAhPT0gMSApKSB7ICAgICAgXG4gICAgICB0aGlzLl9fcHJlZmlsdGVycy5wdXNoKCBcbiAgICAgICAgRmlsdGVycy5TY2FsZSggMCwxLHRoaXMubWluLHRoaXMubWF4ICkgXG4gICAgICApXG4gICAgfVxuICB9LFxuXG4gIHJ1bkZpbHRlcnMoIHZhbHVlLCB3aWRnZXQgKSB7XG4gICAgZm9yKCBsZXQgZmlsdGVyIG9mIHdpZGdldC5fX3ByZWZpbHRlcnMgKSAgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcbiAgICBmb3IoIGxldCBmaWx0ZXIgb2Ygd2lkZ2V0LmZpbHRlcnMgKSAgICAgICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB3aWRnZXQuX19wb3N0ZmlsdGVycyApIHZhbHVlID0gZmlsdGVyKCB2YWx1ZSApXG4gICBcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBvdXRwdXQgb2Ygd2lkZ2V0IGJ5IHJ1bm5pbmcgLl9fdmFsdWUgcHJvcGVydHkgdGhyb3VnaCBmaWx0ZXIgY2hhaW4uXG4gICAqIFRoZSByZXN1bHQgaXMgc3RvcmVkIGluIHRoZSAudmFsdWUgcHJvcGVydHkgb2YgdGhlIHdpZGdldCwgd2hpY2ggaXMgdGhlblxuICAgKiByZXR1cm5lZC5cbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIG91dHB1dCgpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9fdmFsdWUsIG5ld1ZhbHVlR2VuZXJhdGVkID0gZmFsc2UsIGxhc3RWYWx1ZSA9IHRoaXMudmFsdWUsIGlzQXJyYXlcblxuICAgIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KCB2YWx1ZSApXG5cbiAgICBpZiggaXNBcnJheSApIHtcbiAgICAgIHZhbHVlID0gdmFsdWUubWFwKCB2ID0+IFdpZGdldC5ydW5GaWx0ZXJzKCB2LCB0aGlzICkgKVxuICAgIH1lbHNle1xuICAgICAgdmFsdWUgPSB0aGlzLnJ1bkZpbHRlcnMoIHZhbHVlLCB0aGlzIClcbiAgICB9XG4gICAgXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgXG4gICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICkgdGhpcy50cmFuc21pdCggdGhpcy52YWx1ZSApXG5cbiAgICBpZiggdGhpcy5fX3ByZXZWYWx1ZSAhPT0gbnVsbCApIHtcbiAgICAgIGlmKCBpc0FycmF5ICkge1xuICAgICAgICBpZiggIVV0aWxpdGllcy5jb21wYXJlQXJyYXlzKCB0aGlzLl9fdmFsdWUsIHRoaXMuX19wcmV2VmFsdWUgKSApIHtcbiAgICAgICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKCB0aGlzLl9fdmFsdWUgIT09IHRoaXMuX19wcmV2VmFsdWUgKSB7XG4gICAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYoIG5ld1ZhbHVlR2VuZXJhdGVkICkgeyBcbiAgICAgIGlmKCB0aGlzLm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB0aGlzLm9udmFsdWVjaGFuZ2UoIHRoaXMudmFsdWUsIGxhc3RWYWx1ZSApXG5cbiAgICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLl9fdmFsdWUgKSApIHtcbiAgICAgICAgdGhpcy5fX3ByZXZWYWx1ZSA9IHRoaXMuX192YWx1ZS5zbGljZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fcHJldlZhbHVlID0gdGhpcy5fX3ZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbmV3VmFsdWVHZW5lcmF0ZWQgY2FuIGJlIHVzZSB0byBkZXRlcm1pbmUgaWYgd2lkZ2V0IHNob3VsZCBkcmF3XG4gICAgcmV0dXJuIG5ld1ZhbHVlR2VuZXJhdGVkXG4gIH0sXG5cbiAgLyoqXG4gICAqIElmIHRoZSB3aWRnZXQgaGFzIGEgcmVtb3RlIHRhcmdldCAobm90IGEgdGFyZ2V0IGluc2lkZSB0aGUgaW50ZXJmYWNlIHdlYiBwYWdlKVxuICAgKiB0aGlzIHdpbGwgdHJhbnNtaXQgdGhlIHdpZGdldHMgdmFsdWUgdG8gdGhlIHJlbW90ZSBkZXN0aW5hdGlvbi5cbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHRyYW5zbWl0KCBvdXRwdXQgKSB7XG4gICAgaWYoIHRoaXMudGFyZ2V0ID09PSAnb3NjJyApIHtcbiAgICAgIENvbW11bmljYXRpb24uT1NDLnNlbmQoIHRoaXMuYWRkcmVzcywgb3V0cHV0IClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHRoaXMudGFyZ2V0WyB0aGlzLmtleSBdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy50YXJnZXRbIHRoaXMua2V5IF0gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgdGhpcy50YXJnZXRbIHRoaXMua2V5IF0oIG91dHB1dCApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMudGFyZ2V0WyB0aGlzLmtleSBdID0gb3V0cHV0IFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRcbiIsImxldCBXaWRnZXRMYWJlbCA9IHtcblxuICBkZWZhdWx0czoge1xuICAgIHNpemU6MjQsXG4gICAgZmFjZTonc2Fucy1zZXJpZicsXG4gICAgZmlsbDond2hpdGUnLFxuICAgIGFsaWduOidjZW50ZXInLFxuICAgIGJhY2tncm91bmQ6bnVsbCxcbiAgICB3aWR0aDoxXG4gIH0sXG5cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbGFiZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGxhYmVsLCB0aGlzLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggdHlwZW9mIGxhYmVsLmN0eCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoICdXaWRnZXRMYWJlbHMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoIGEgY2FudmFzIGNvbnRleHQgKGN0eCkgYXJndW1lbnQnIClcbiAgICBcbiAgICBsYWJlbC5mb250ID0gYCR7bGFiZWwuc2l6ZX1weCAke2xhYmVsLmZhY2V9YFxuXG4gICAgcmV0dXJuIGxhYmVsXG4gIH0sXG5cbiAgZHJhdygpIHtcbiAgICBsZXQgY252cyA9IHRoaXMuY3R4LmNhbnZhcyxcbiAgICAgICAgY3dpZHRoID0gY252cy53aWR0aCxcbiAgICAgICAgY2hlaWdodD0gY252cy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMueCAqIGN3aWR0aCxcbiAgICAgICAgeSAgICAgID0gdGhpcy55ICogY2hlaWdodCxcbiAgICAgICAgd2lkdGggID0gdGhpcy53aWR0aCAqIGN3aWR0aFxuXG4gICAgaWYoIHRoaXMuYmFja2dyb3VuZCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZFxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHgseSx3aWR0aCx0aGlzLnNpemUgKyAxMCApXG4gICAgfVxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IHRoaXMuYWxpZ25cbiAgICB0aGlzLmN0eC5mb250ID0gdGhpcy5mb250XG4gICAgdGhpcy5jdHguZmlsbFRleHQoIHRoaXMudGV4dCwgeCx5LHdpZHRoICkgICAgXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRMYWJlbFxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcbmltcG9ydCBWZWMyIGZyb20gJ3ZpY3RvcidcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBYWVxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgWFkgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggWFksIHtcbiAgLyoqIEBsZW5kcyBYWS5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIFhZIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBYWVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBUaGUgY291bnQgcHJvcGVydHkgZGV0ZXJtaW5lcyB0aGUgbnVtYmVyIG9mIHNsaWRlcnMgaW4gdGhlIG11bHRpc2xpZGVyLCBkZWZhdWx0IDQuXG4gICAgICogQG1lbWJlcm9mIFhZXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge0ludGVnZXJ9XG4gICAgICovXG4gICAgY291bnQ6NCxcbiAgICBsaW5lV2lkdGg6MSxcbiAgICB1c2VQaHlzaWNzOnRydWUsXG4gICAgdG91Y2hTaXplOjUwLFxuICAgIGZpbGw6J3JnYmEoIDI1NSwyNTUsMjU1LCAuMiApJyxcbiAgICBzdHJva2U6JyM5OTknLFxuICAgIGJhY2tncm91bmQ6JyMwMDAnLFxuICAgIGZyaWN0aW9uOi4wLFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgWFkgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBYWVxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgWFkgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgeHkgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIFhZIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCB4eSApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIHh5LCBYWS5kZWZhdWx0cywgcHJvcHMsIHtcbiAgICAgIHZhbHVlOltdLFxuICAgICAgX192YWx1ZTpbXSxcbiAgICAgIHRvdWNoZXM6W10sXG4gICAgfSlcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgLy8gaWYoIHByb3BzLnZhbHVlICkgeHkuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICB4eS5pbml0KClcbiAgICBcbiAgICB4eS5vbnBsYWNlID0gKCkgPT4ge1xuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4eS5jb3VudDsgaSsrICkge1xuICAgICAgICB4eS50b3VjaGVzLnB1c2goe1xuICAgICAgICAgIHBvczogbmV3IFZlYzIoIGkgKiAoIHh5LnJlY3Qud2lkdGggLyB4eS5jb3VudCApLCBpICogKCB4eS5yZWN0LmhlaWdodCAvIHh5LmNvdW50ICkgKSxcbiAgICAgICAgICB2ZWw6IG5ldyBWZWMyKCAwLDAgKSxcbiAgICAgICAgICBhY2M6IG5ldyBWZWMyKCAuMDUsLjA1ICksXG4gICAgICAgICAgbmFtZTogeHkubmFtZXMgPT09IHVuZGVmaW5lZCA/IGkgOiB4eS5uYW1lc1sgaSBdXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHh5LnN0YXJ0QW5pbWF0aW9uTG9vcCgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHh5XG4gIH0sXG5cbiAgc3RhcnRBbmltYXRpb25Mb29wKCkge1xuICAgIHRoaXMuZHJhdyggdHJ1ZSApXG5cbiAgICBsZXQgbG9vcCA9ICgpPT4geyBcbiAgICAgIHRoaXMuZHJhdygpXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBsb29wIClcbiAgICB9XG5cbiAgICBsb29wKClcbiAgfSxcblxuICBhbmltYXRlKCkge1xuICAgIGxldCBzaG91bGREcmF3ID0gdHJ1ZSBcbiAgICBsZXQgX19mcmljdGlvbiA9IG5ldyBWZWMyKCAtMSAqIHRoaXMuZnJpY3Rpb24sIC0xICogdGhpcy5mcmljdGlvbiApXG4gICAgZm9yKCBsZXQgdG91Y2ggb2YgdGhpcy50b3VjaGVzICkge1xuICAgICAgaWYoIHRvdWNoLnZlbC54ICE9PSAwICYmIHRvdWNoLnZlbC55ICE9PSAwICkge1xuICAgICAgICAvL3RvdWNoLnZlbC5hZGQoIHRvdWNoLmFjYyApXG4gICAgICAgIGxldCBmcmljdGlvbiA9IHRvdWNoLnZlbC5jbG9uZSgpXG4gICAgICAgIGZyaWN0aW9uLnggKj0gLTEgKiB0aGlzLmZyaWN0aW9uXG4gICAgICAgIGZyaWN0aW9uLnkgKj0gLTEgKiB0aGlzLmZyaWN0aW9uXG4gICAgICAgIHRvdWNoLnZlbC5hZGQoIGZyaWN0aW9uIClcblxuICAgICAgICBpZiggKHRvdWNoLnBvcy54IC0gdGhpcy50b3VjaFNpemUpICsgdG91Y2gudmVsLnggPCAwICkge1xuICAgICAgICAgIHRvdWNoLnBvcy54ID0gdGhpcy50b3VjaFNpemVcbiAgICAgICAgICB0b3VjaC52ZWwueCAqPSAtMVxuICAgICAgICB9IGVsc2UgaWYgKCB0b3VjaC5wb3MueCArIHRoaXMudG91Y2hTaXplICsgdG91Y2gudmVsLnggPiB0aGlzLnJlY3Qud2lkdGggKSB7XG4gICAgICAgICAgdG91Y2gucG9zLnggPSB0aGlzLnJlY3Qud2lkdGggLSB0aGlzLnRvdWNoU2l6ZVxuICAgICAgICAgIHRvdWNoLnZlbC54ICo9IC0xXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG91Y2gucG9zLnggKz0gdG91Y2gudmVsLnggXG4gICAgICAgIH1cblxuICAgICAgICBpZiggKHRvdWNoLnBvcy55IC0gdGhpcy50b3VjaFNpemUpICsgdG91Y2gudmVsLnkgPCAwICkgeyBcbiAgICAgICAgICB0b3VjaC5wb3MueSA9IHRoaXMudG91Y2hTaXplXG4gICAgICAgICAgdG91Y2gudmVsLnkgKj0gLTFcbiAgICAgICAgfSBlbHNlIGlmICggdG91Y2gucG9zLnkgKyB0aGlzLnRvdWNoU2l6ZSArIHRvdWNoLnZlbC55ID4gdGhpcy5yZWN0LmhlaWdodCApIHtcbiAgICAgICAgICB0b3VjaC5wb3MueSA9IHRoaXMucmVjdC5oZWlnaHQgLSB0aGlzLnRvdWNoU2l6ZVxuICAgICAgICAgIHRvdWNoLnZlbC55ICo9IC0xXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRvdWNoLnBvcy55ICs9IHRvdWNoLnZlbC55XG4gICAgICAgIH1cblxuICAgICAgICBzaG91bGREcmF3ID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzaG91bGREcmF3XG4gIH0sXG4gIFxuICAvKipcbiAgICogRHJhdyB0aGUgWFkgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBYWVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoIG92ZXJyaWRlPWZhbHNlICkge1xuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5hbmltYXRlKClcblxuICAgIGlmKCBzaG91bGREcmF3ID09PSBmYWxzZSAmJiBvdmVycmlkZSA9PT0gZmFsc2UgKSByZXR1cm5cblxuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKHh5IHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG4gICAgICBsZXQgY2hpbGQgPSB0aGlzLnRvdWNoZXNbIGkgXVxuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG5cbiAgICAgIHRoaXMuY3R4LmFyYyggY2hpbGQucG9zLngsIGNoaWxkLnBvcy55LCB0aGlzLnRvdWNoU2l6ZSwgMCwgTWF0aC5QSSAqIDIsIHRydWUgKVxuXG4gICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuXG4gICAgICB0aGlzLmN0eC5maWxsKClcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggdGhpcy54ICsgY2hpbGQueCwgdGhpcy55ICsgY2hpbGQueSwgdGhpcy5jaGlsZFdpZHRoLCB0aGlzLmNoaWxkSGVpZ2h0KTtcbiAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnXG4gICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5zdHJva2VcbiAgICAgIHRoaXMuY3R4LmZvbnQgPSAnbm9ybWFsIDIwcHggSGVsdmV0aWNhJ1xuICAgICAgdGhpcy5jdHguZmlsbFRleHQoIGNoaWxkLm5hbWUsIGNoaWxkLnBvcy54LCBjaGlsZC5wb3MueSApXG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgIHRoaXMucG9pbnRlcnVwIClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIHh5IHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIFxuICAgICAgLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgLy9pZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICAvL3RoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICAvL3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgLy99XG4gICAgICBsZXQgdG91Y2ggPSB0aGlzLnRvdWNoZXMuZmluZCggdCA9PiB0LnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQgKVxuXG4gICAgICBpZiggdG91Y2ggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ2ZvdW5kJywgdG91Y2gubmFtZSwgZS5wb2ludGVySWQgKVxuICAgICAgICB0b3VjaC52ZWwueCA9ICggZS5jbGllbnRYIC0gdG91Y2gubGFzdFggKSAqIC41XG4gICAgICAgIHRvdWNoLnZlbC55ID0gKCBlLmNsaWVudFkgLSB0b3VjaC5sYXN0WSApICogLjVcbiAgICAgICAgLy9jb25zb2xlLmxvZyggdG91Y2gudmVsLngsIGUuY2xpZW50WCwgdG91Y2gubGFzdFgsIHRvdWNoLnBvcy54ICApXG4gICAgICAgIHRvdWNoLnBvaW50ZXJJZCA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLmxvZygndW5kZWZpbmVkIHRvdWNoJywgZS5wb2ludGVySWQgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGxldCB0b3VjaCA9IHRoaXMudG91Y2hlcy5maW5kKCB0ID0+IHQucG9pbnRlcklkID09PSBlLnBvaW50ZXJJZCApXG5cbiAgICAgIGlmKCB0b3VjaCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0b3VjaC5sYXN0WCA9IHRvdWNoLnBvcy54XG4gICAgICAgIHRvdWNoLmxhc3RZID0gdG91Y2gucG9zLnlcblxuICAgICAgICB0b3VjaC5wb3MueCA9IGUuY2xpZW50WFxuICAgICAgICB0b3VjaC5wb3MueSA9IGUuY2xpZW50WVxuICAgICAgfVxuXG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBYWSdzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFhZXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgY2xvc2VzdERpZmYgPSBJbmZpbml0eSxcbiAgICAgICAgdG91Y2hGb3VuZCA9IG51bGwsXG4gICAgICAgIHRvdWNoTnVtID0gbnVsbFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB0b3VjaCA9IHRoaXMudG91Y2hlc1sgaSBdLFxuICAgICAgICAgIHhkaWZmID0gTWF0aC5hYnMoIHRvdWNoLnBvcy54IC0gZS5jbGllbnRYICksXG4gICAgICAgICAgeWRpZmYgPSBNYXRoLmFicyggdG91Y2gucG9zLnkgLSBlLmNsaWVudFkgKVxuXG4gICAgICBpZiggeGRpZmYgKyB5ZGlmZiA8IGNsb3Nlc3REaWZmICkge1xuICAgICAgICBjbG9zZXN0RGlmZiA9IHhkaWZmICsgeWRpZmZcbiAgICAgICAgdG91Y2hGb3VuZCA9IHRvdWNoXG4gICAgICAgIHRvdWNoTnVtID0gaVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAndG91Y2ggZm91bmQnLCB0b3VjaE51bSwgY2xvc2VzdERpZmYsIGUucG9pbnRlcklkIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0b3VjaEZvdW5kLmlzQWN0aXZlID0gdHJ1ZVxuICAgIHRvdWNoRm91bmQudmVsLnggPSAwXG4gICAgdG91Y2hGb3VuZC52ZWwueSA9IDBcbiAgICB0b3VjaEZvdW5kLnBvcy54ID0gdG91Y2hGb3VuZC5sYXN0WCA9IGUuY2xpZW50WFxuICAgIHRvdWNoRm91bmQucG9zLnkgPSB0b3VjaEZvdW5kLmxhc3RZID0gZS5jbGllbnRZXG4gICAgdG91Y2hGb3VuZC5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgLy90b3VjaEZvdW5kLmlkZW50aWZpZXIgPSBfdG91Y2guaWRlbnRpZmllclxuICAgIC8vdG91Y2hGb3VuZC5jaGlsZElEID0gdG91Y2hOdW1cbiAgICAvL2lmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgLy8gIHNsaWRlck51bSA9IE1hdGguZmxvb3IoICggZS5jbGllbnRZIC8gdGhpcy5yZWN0LmhlaWdodCApIC8gKCAxL3RoaXMuY291bnQgKSApXG4gICAgLy8gIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICAvL31lbHNle1xuICAgIC8vICBzbGlkZXJOdW0gPSBNYXRoLmZsb29yKCAoIGUuY2xpZW50WCAvIHRoaXMucmVjdC53aWR0aCApIC8gKCAxL3RoaXMuY291bnQgKSApXG4gICAgLy8gIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAxIC0gKCBlLmNsaWVudFkgLSB0aGlzLnJlY3QudG9wICApIC8gdGhpcy5yZWN0LmhlaWdodCBcbiAgICAvL31cblxuICAgIC8vZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgICkge1xuICAgIC8vICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPiAxICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAxXG4gICAgLy8gIGlmKCB0aGlzLl9fdmFsdWVbIGkgXSA8IDAgKSB0aGlzLl9fdmFsdWVbIGkgXSA9IDBcbiAgICAvL31cblxuICAgIC8vbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgLy9pZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gWFlcbiIsIi8qIVxuICogUEVQIHYwLjQuMSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvUEVQXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyB8IGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICBnbG9iYWwuUG9pbnRlckV2ZW50c1BvbHlmaWxsID0gZmFjdG9yeSgpXG59KHRoaXMsIGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBjb25zdHJ1Y3RvciBmb3IgbmV3IFBvaW50ZXJFdmVudHMuXG4gICAqXG4gICAqIE5ldyBQb2ludGVyIEV2ZW50cyBtdXN0IGJlIGdpdmVuIGEgdHlwZSwgYW5kIGFuIG9wdGlvbmFsIGRpY3Rpb25hcnkgb2ZcbiAgICogaW5pdGlhbGl6YXRpb24gcHJvcGVydGllcy5cbiAgICpcbiAgICogRHVlIHRvIGNlcnRhaW4gcGxhdGZvcm0gcmVxdWlyZW1lbnRzLCBldmVudHMgcmV0dXJuZWQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICogaWRlbnRpZnkgYXMgTW91c2VFdmVudHMuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge1N0cmluZ30gaW5UeXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCB0byBjcmVhdGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbaW5EaWN0XSBBbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mIGluaXRpYWwgZXZlbnQgcHJvcGVydGllcy5cbiAgICogQHJldHVybiB7RXZlbnR9IEEgbmV3IFBvaW50ZXJFdmVudCBvZiB0eXBlIGBpblR5cGVgLCBpbml0aWFsaXplZCB3aXRoIHByb3BlcnRpZXMgZnJvbSBgaW5EaWN0YC5cbiAgICovXG4gIHZhciBNT1VTRV9QUk9QUyA9IFtcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWSdcbiAgXTtcblxuICB2YXIgTU9VU0VfREVGQVVMVFMgPSBbXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMFxuICBdO1xuXG4gIGZ1bmN0aW9uIFBvaW50ZXJFdmVudChpblR5cGUsIGluRGljdCkge1xuICAgIGluRGljdCA9IGluRGljdCB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICBlLmluaXRFdmVudChpblR5cGUsIGluRGljdC5idWJibGVzIHx8IGZhbHNlLCBpbkRpY3QuY2FuY2VsYWJsZSB8fCBmYWxzZSk7XG5cbiAgICAvLyBkZWZpbmUgaW5oZXJpdGVkIE1vdXNlRXZlbnQgcHJvcGVydGllc1xuICAgIC8vIHNraXAgYnViYmxlcyBhbmQgY2FuY2VsYWJsZSBzaW5jZSB0aGV5J3JlIHNldCBhYm92ZSBpbiBpbml0RXZlbnQoKVxuICAgIGZvciAodmFyIGkgPSAyLCBwOyBpIDwgTU9VU0VfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHAgPSBNT1VTRV9QUk9QU1tpXTtcbiAgICAgIGVbcF0gPSBpbkRpY3RbcF0gfHwgTU9VU0VfREVGQVVMVFNbaV07XG4gICAgfVxuICAgIGUuYnV0dG9ucyA9IGluRGljdC5idXR0b25zIHx8IDA7XG5cbiAgICAvLyBTcGVjIHJlcXVpcmVzIHRoYXQgcG9pbnRlcnMgd2l0aG91dCBwcmVzc3VyZSBzcGVjaWZpZWQgdXNlIDAuNSBmb3IgZG93blxuICAgIC8vIHN0YXRlIGFuZCAwIGZvciB1cCBzdGF0ZS5cbiAgICB2YXIgcHJlc3N1cmUgPSAwO1xuICAgIGlmIChpbkRpY3QucHJlc3N1cmUpIHtcbiAgICAgIHByZXNzdXJlID0gaW5EaWN0LnByZXNzdXJlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVzc3VyZSA9IGUuYnV0dG9ucyA/IDAuNSA6IDA7XG4gICAgfVxuXG4gICAgLy8gYWRkIHgveSBwcm9wZXJ0aWVzIGFsaWFzZWQgdG8gY2xpZW50WC9ZXG4gICAgZS54ID0gZS5jbGllbnRYO1xuICAgIGUueSA9IGUuY2xpZW50WTtcblxuICAgIC8vIGRlZmluZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgUG9pbnRlckV2ZW50IGludGVyZmFjZVxuICAgIGUucG9pbnRlcklkID0gaW5EaWN0LnBvaW50ZXJJZCB8fCAwO1xuICAgIGUud2lkdGggPSBpbkRpY3Qud2lkdGggfHwgMDtcbiAgICBlLmhlaWdodCA9IGluRGljdC5oZWlnaHQgfHwgMDtcbiAgICBlLnByZXNzdXJlID0gcHJlc3N1cmU7XG4gICAgZS50aWx0WCA9IGluRGljdC50aWx0WCB8fCAwO1xuICAgIGUudGlsdFkgPSBpbkRpY3QudGlsdFkgfHwgMDtcbiAgICBlLnBvaW50ZXJUeXBlID0gaW5EaWN0LnBvaW50ZXJUeXBlIHx8ICcnO1xuICAgIGUuaHdUaW1lc3RhbXAgPSBpbkRpY3QuaHdUaW1lc3RhbXAgfHwgMDtcbiAgICBlLmlzUHJpbWFyeSA9IGluRGljdC5pc1ByaW1hcnkgfHwgZmFsc2U7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICB2YXIgX1BvaW50ZXJFdmVudCA9IFBvaW50ZXJFdmVudDtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgaW1wbGVtZW50cyBhIG1hcCBvZiBwb2ludGVyIHN0YXRlc1xuICAgKi9cbiAgdmFyIFVTRV9NQVAgPSB3aW5kb3cuTWFwICYmIHdpbmRvdy5NYXAucHJvdG90eXBlLmZvckVhY2g7XG4gIHZhciBQb2ludGVyTWFwID0gVVNFX01BUCA/IE1hcCA6IFNwYXJzZUFycmF5TWFwO1xuXG4gIGZ1bmN0aW9uIFNwYXJzZUFycmF5TWFwKCkge1xuICAgIHRoaXMuYXJyYXkgPSBbXTtcbiAgICB0aGlzLnNpemUgPSAwO1xuICB9XG5cbiAgU3BhcnNlQXJyYXlNYXAucHJvdG90eXBlID0ge1xuICAgIHNldDogZnVuY3Rpb24oaywgdikge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoayk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaGFzKGspKSB7XG4gICAgICAgIHRoaXMuc2l6ZSsrO1xuICAgICAgfVxuICAgICAgdGhpcy5hcnJheVtrXSA9IHY7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5W2tdICE9PSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKGspIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5hcnJheVtrXTtcbiAgICAgICAgdGhpcy5zaXplLS07XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5W2tdO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5zaXplID0gMDtcbiAgICB9LFxuXG4gICAgLy8gcmV0dXJuIHZhbHVlLCBrZXksIG1hcFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2LCBrLCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3BvaW50ZXJtYXAgPSBQb2ludGVyTWFwO1xuXG4gIHZhciBDTE9ORV9QUk9QUyA9IFtcblxuICAgIC8vIE1vdXNlRXZlbnRcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcblxuICAgIC8vIERPTSBMZXZlbCAzXG4gICAgJ2J1dHRvbnMnLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgJ3BvaW50ZXJJZCcsXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAncHJlc3N1cmUnLFxuICAgICd0aWx0WCcsXG4gICAgJ3RpbHRZJyxcbiAgICAncG9pbnRlclR5cGUnLFxuICAgICdod1RpbWVzdGFtcCcsXG4gICAgJ2lzUHJpbWFyeScsXG5cbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICd0eXBlJyxcbiAgICAndGFyZ2V0JyxcbiAgICAnY3VycmVudFRhcmdldCcsXG4gICAgJ3doaWNoJyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWScsXG4gICAgJ3RpbWVTdGFtcCdcbiAgXTtcblxuICB2YXIgQ0xPTkVfREVGQVVMVFMgPSBbXG5cbiAgICAvLyBNb3VzZUV2ZW50XG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuXG4gICAgLy8gRE9NIExldmVsIDNcbiAgICAwLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgJycsXG4gICAgMCxcbiAgICBmYWxzZSxcblxuICAgIC8vIGV2ZW50IGluc3RhbmNlXG4gICAgJycsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICB2YXIgQk9VTkRBUllfRVZFTlRTID0ge1xuICAgICdwb2ludGVyb3Zlcic6IDEsXG4gICAgJ3BvaW50ZXJvdXQnOiAxLFxuICAgICdwb2ludGVyZW50ZXInOiAxLFxuICAgICdwb2ludGVybGVhdmUnOiAxXG4gIH07XG5cbiAgdmFyIEhBU19TVkdfSU5TVEFOQ0UgPSAodHlwZW9mIFNWR0VsZW1lbnRJbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSBpcyBmb3Igbm9ybWFsaXppbmcgZXZlbnRzLiBNb3VzZSBhbmQgVG91Y2ggZXZlbnRzIHdpbGwgYmVcbiAgICogY29sbGVjdGVkIGhlcmUsIGFuZCBmaXJlIFBvaW50ZXJFdmVudHMgdGhhdCBoYXZlIHRoZSBzYW1lIHNlbWFudGljcywgbm9cbiAgICogbWF0dGVyIHRoZSBzb3VyY2UuXG4gICAqIEV2ZW50cyBmaXJlZDpcbiAgICogICAtIHBvaW50ZXJkb3duOiBhIHBvaW50aW5nIGlzIGFkZGVkXG4gICAqICAgLSBwb2ludGVydXA6IGEgcG9pbnRlciBpcyByZW1vdmVkXG4gICAqICAgLSBwb2ludGVybW92ZTogYSBwb2ludGVyIGlzIG1vdmVkXG4gICAqICAgLSBwb2ludGVyb3ZlcjogYSBwb2ludGVyIGNyb3NzZXMgaW50byBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyb3V0OiBhIHBvaW50ZXIgbGVhdmVzIGFuIGVsZW1lbnRcbiAgICogICAtIHBvaW50ZXJjYW5jZWw6IGEgcG9pbnRlciB3aWxsIG5vIGxvbmdlciBnZW5lcmF0ZSBldmVudHNcbiAgICovXG4gIHZhciBkaXNwYXRjaGVyID0ge1xuICAgIHBvaW50ZXJtYXA6IG5ldyBfcG9pbnRlcm1hcCgpLFxuICAgIGV2ZW50TWFwOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGNhcHR1cmVJbmZvOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuXG4gICAgLy8gU2NvcGUgb2JqZWN0cyBmb3IgbmF0aXZlIGV2ZW50cy5cbiAgICAvLyBUaGlzIGV4aXN0cyBmb3IgZWFzZSBvZiB0ZXN0aW5nLlxuICAgIGV2ZW50U291cmNlczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBldmVudFNvdXJjZUxpc3Q6IFtdLFxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBldmVudCBzb3VyY2UgdGhhdCB3aWxsIGdlbmVyYXRlIHBvaW50ZXIgZXZlbnRzLlxuICAgICAqXG4gICAgICogYGluU291cmNlYCBtdXN0IGNvbnRhaW4gYW4gYXJyYXkgb2YgZXZlbnQgbmFtZXMgbmFtZWQgYGV2ZW50c2AsIGFuZFxuICAgICAqIGZ1bmN0aW9ucyB3aXRoIHRoZSBuYW1lcyBzcGVjaWZpZWQgaW4gdGhlIGBldmVudHNgIGFycmF5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgbmFtZSBmb3IgdGhlIGV2ZW50IHNvdXJjZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgQSBuZXcgc291cmNlIG9mIHBsYXRmb3JtIGV2ZW50cy5cbiAgICAgKi9cbiAgICByZWdpc3RlclNvdXJjZTogZnVuY3Rpb24obmFtZSwgc291cmNlKSB7XG4gICAgICB2YXIgcyA9IHNvdXJjZTtcbiAgICAgIHZhciBuZXdFdmVudHMgPSBzLmV2ZW50cztcbiAgICAgIGlmIChuZXdFdmVudHMpIHtcbiAgICAgICAgbmV3RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChzW2VdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFwW2VdID0gc1tlXS5iaW5kKHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VzW25hbWVdID0gcztcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZUxpc3QucHVzaChzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgbCA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0Lmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlczsgKGkgPCBsKSAmJiAoZXMgPSB0aGlzLmV2ZW50U291cmNlTGlzdFtpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIGNhbGwgZXZlbnRzb3VyY2UgcmVnaXN0ZXJcbiAgICAgICAgZXMucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgbCA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0Lmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlczsgKGkgPCBsKSAmJiAoZXMgPSB0aGlzLmV2ZW50U291cmNlTGlzdFtpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIGNhbGwgZXZlbnRzb3VyY2UgcmVnaXN0ZXJcbiAgICAgICAgZXMudW5yZWdpc3Rlci5jYWxsKGVzLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5zOiAvKnNjb3BlLmV4dGVybmFsLmNvbnRhaW5zIHx8ICovZnVuY3Rpb24oY29udGFpbmVyLCBjb250YWluZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjb250YWluZXIuY29udGFpbnMoY29udGFpbmVkKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG5cbiAgICAgICAgLy8gbW9zdCBsaWtlbHk6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTIwODQyN1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEVWRU5UU1xuICAgIGRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmRvd24nLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm1vdmUnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIHVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJ1cCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgZW50ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJlbnRlcicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbGVhdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJsZWF2ZScsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgb3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyb3ZlcicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgb3V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJvdXQnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyY2FuY2VsJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBsZWF2ZU91dDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMub3V0KGV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC50YXJnZXQsIGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgIHRoaXMubGVhdmUoZXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW50ZXJPdmVyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdGhpcy5vdmVyKGV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC50YXJnZXQsIGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgIHRoaXMuZW50ZXIoZXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMSVNURU5FUiBMT0dJQ1xuICAgIGV2ZW50SGFuZGxlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuXG4gICAgICAvLyBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCBtdWx0aXBsZSBkaXNwYXRjaCBvZiBwb2ludGVyZXZlbnRzIGZyb21cbiAgICAgIC8vIHBsYXRmb3JtIGV2ZW50cy4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gdHdvIGVsZW1lbnRzIGluIGRpZmZlcmVudCBzY29wZXNcbiAgICAgIC8vIGFyZSBzZXQgdXAgdG8gY3JlYXRlIHBvaW50ZXIgZXZlbnRzLCB3aGljaCBpcyByZWxldmFudCB0byBTaGFkb3cgRE9NLlxuICAgICAgaWYgKGluRXZlbnQuX2hhbmRsZWRCeVBFKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gaW5FdmVudC50eXBlO1xuICAgICAgdmFyIGZuID0gdGhpcy5ldmVudE1hcCAmJiB0aGlzLmV2ZW50TWFwW3R5cGVdO1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIGZuKGluRXZlbnQpO1xuICAgICAgfVxuICAgICAgaW5FdmVudC5faGFuZGxlZEJ5UEUgPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBzZXQgdXAgZXZlbnQgbGlzdGVuZXJzXG4gICAgbGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50cykge1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmFkZEV2ZW50KHRhcmdldCwgZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVyc1xuICAgIHVubGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50cykge1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50KHRhcmdldCwgZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGFkZEV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLmFkZEV2ZW50IHx8ICovZnVuY3Rpb24odGFyZ2V0LCBldmVudE5hbWUpIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5ib3VuZEhhbmRsZXIpO1xuICAgIH0sXG4gICAgcmVtb3ZlRXZlbnQ6IC8qc2NvcGUuZXh0ZXJuYWwucmVtb3ZlRXZlbnQgfHwgKi9mdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSkge1xuICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmJvdW5kSGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8vIEVWRU5UIENSRUFUSU9OIEFORCBUUkFDS0lOR1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgYmFzZWQgb24gdGhlIGluZm9ybWF0aW9uIGluXG4gICAgICogYGluRXZlbnRgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGluVHlwZSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHR5cGUgb2YgZXZlbnQgdG8gY3JlYXRlXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBIHBsYXRmb3JtIGV2ZW50IHdpdGggYSB0YXJnZXRcbiAgICAgKiBAcmV0dXJuIHtFdmVudH0gQSBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYFxuICAgICAqL1xuICAgIG1ha2VFdmVudDogZnVuY3Rpb24oaW5UeXBlLCBpbkV2ZW50KSB7XG5cbiAgICAgIC8vIHJlbGF0ZWRUYXJnZXQgbXVzdCBiZSBudWxsIGlmIHBvaW50ZXIgaXMgY2FwdHVyZWRcbiAgICAgIGlmICh0aGlzLmNhcHR1cmVJbmZvW2luRXZlbnQucG9pbnRlcklkXSkge1xuICAgICAgICBpbkV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIGUgPSBuZXcgX1BvaW50ZXJFdmVudChpblR5cGUsIGluRXZlbnQpO1xuICAgICAgaWYgKGluRXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGluRXZlbnQucHJldmVudERlZmF1bHQ7XG4gICAgICB9XG4gICAgICBlLl90YXJnZXQgPSBlLl90YXJnZXQgfHwgaW5FdmVudC50YXJnZXQ7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy8gbWFrZSBhbmQgZGlzcGF0Y2ggYW4gZXZlbnQgaW4gb25lIGNhbGxcbiAgICBmaXJlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLm1ha2VFdmVudChpblR5cGUsIGluRXZlbnQpO1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzbmFwc2hvdCBvZiBpbkV2ZW50LCB3aXRoIHdyaXRhYmxlIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IEFuIGV2ZW50IHRoYXQgY29udGFpbnMgcHJvcGVydGllcyB0byBjb3B5LlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2hhbGxvdyBjb3BpZXMgb2YgYGluRXZlbnRgJ3NcbiAgICAgKiAgICBwcm9wZXJ0aWVzLlxuICAgICAqL1xuICAgIGNsb25lRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBldmVudENvcHkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgdmFyIHA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IENMT05FX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHAgPSBDTE9ORV9QUk9QU1tpXTtcbiAgICAgICAgZXZlbnRDb3B5W3BdID0gaW5FdmVudFtwXSB8fCBDTE9ORV9ERUZBVUxUU1tpXTtcblxuICAgICAgICAvLyBXb3JrIGFyb3VuZCBTVkdJbnN0YW5jZUVsZW1lbnQgc2hhZG93IHRyZWVcbiAgICAgICAgLy8gUmV0dXJuIHRoZSA8dXNlPiBlbGVtZW50IHRoYXQgaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGluc3RhbmNlIGZvciBTYWZhcmksIENocm9tZSwgSUUuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGJlaGF2aW9yIGltcGxlbWVudGVkIGJ5IEZpcmVmb3guXG4gICAgICAgIGlmIChIQVNfU1ZHX0lOU1RBTkNFICYmIChwID09PSAndGFyZ2V0JyB8fCBwID09PSAncmVsYXRlZFRhcmdldCcpKSB7XG4gICAgICAgICAgaWYgKGV2ZW50Q29weVtwXSBpbnN0YW5jZW9mIFNWR0VsZW1lbnRJbnN0YW5jZSkge1xuICAgICAgICAgICAgZXZlbnRDb3B5W3BdID0gZXZlbnRDb3B5W3BdLmNvcnJlc3BvbmRpbmdVc2VFbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBrZWVwIHRoZSBzZW1hbnRpY3Mgb2YgcHJldmVudERlZmF1bHRcbiAgICAgIGlmIChpbkV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2ZW50Q29weS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBldmVudENvcHk7XG4gICAgfSxcbiAgICBnZXRUYXJnZXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBjYXB0dXJlID0gdGhpcy5jYXB0dXJlSW5mb1tpbkV2ZW50LnBvaW50ZXJJZF07XG4gICAgICBpZiAoIWNhcHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGluRXZlbnQuX3RhcmdldDtcbiAgICAgIH1cbiAgICAgIGlmIChpbkV2ZW50Ll90YXJnZXQgPT09IGNhcHR1cmUgfHwgIShpbkV2ZW50LnR5cGUgaW4gQk9VTkRBUllfRVZFTlRTKSkge1xuICAgICAgICByZXR1cm4gY2FwdHVyZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldENhcHR1cmU6IGZ1bmN0aW9uKGluUG9pbnRlcklkLCBpblRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZUNhcHR1cmUoaW5Qb2ludGVySWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF0gPSBpblRhcmdldDtcbiAgICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBlLmluaXRFdmVudCgnZ290cG9pbnRlcmNhcHR1cmUnLCB0cnVlLCBmYWxzZSk7XG4gICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgdGhpcy5pbXBsaWNpdFJlbGVhc2UgPSB0aGlzLnJlbGVhc2VDYXB0dXJlLmJpbmQodGhpcywgaW5Qb2ludGVySWQpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgIGUuX3RhcmdldCA9IGluVGFyZ2V0O1xuICAgICAgdGhpcy5hc3luY0Rpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICByZWxlYXNlQ2FwdHVyZTogZnVuY3Rpb24oaW5Qb2ludGVySWQpIHtcbiAgICAgIHZhciB0ID0gdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF07XG4gICAgICBpZiAodCkge1xuICAgICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICBlLmluaXRFdmVudCgnbG9zdHBvaW50ZXJjYXB0dXJlJywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgICB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgICBlLl90YXJnZXQgPSB0O1xuICAgICAgICB0aGlzLmFzeW5jRGlzcGF0Y2hFdmVudChlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgdGhlIGV2ZW50IHRvIGl0cyB0YXJnZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IFRoZSBldmVudCB0byBiZSBkaXNwYXRjaGVkLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IFRydWUgaWYgYW4gZXZlbnQgaGFuZGxlciByZXR1cm5zIHRydWUsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBkaXNwYXRjaEV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLmRpc3BhdGNoRXZlbnQgfHwgKi9mdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdCA9IHRoaXMuZ2V0VGFyZ2V0KGluRXZlbnQpO1xuICAgICAgaWYgKHQpIHtcbiAgICAgICAgcmV0dXJuIHQuZGlzcGF0Y2hFdmVudChpbkV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzeW5jRGlzcGF0Y2hFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZGlzcGF0Y2hFdmVudC5iaW5kKHRoaXMsIGluRXZlbnQpKTtcbiAgICB9XG4gIH07XG4gIGRpc3BhdGNoZXIuYm91bmRIYW5kbGVyID0gZGlzcGF0Y2hlci5ldmVudEhhbmRsZXIuYmluZChkaXNwYXRjaGVyKTtcblxuICB2YXIgX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gIHZhciB0YXJnZXRpbmcgPSB7XG4gICAgc2hhZG93OiBmdW5jdGlvbihpbkVsKSB7XG4gICAgICBpZiAoaW5FbCkge1xuICAgICAgICByZXR1cm4gaW5FbC5zaGFkb3dSb290IHx8IGluRWwud2Via2l0U2hhZG93Um9vdDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNhblRhcmdldDogZnVuY3Rpb24oc2hhZG93KSB7XG4gICAgICByZXR1cm4gc2hhZG93ICYmIEJvb2xlYW4oc2hhZG93LmVsZW1lbnRGcm9tUG9pbnQpO1xuICAgIH0sXG4gICAgdGFyZ2V0aW5nU2hhZG93OiBmdW5jdGlvbihpbkVsKSB7XG4gICAgICB2YXIgcyA9IHRoaXMuc2hhZG93KGluRWwpO1xuICAgICAgaWYgKHRoaXMuY2FuVGFyZ2V0KHMpKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgIH0sXG4gICAgb2xkZXJTaGFkb3c6IGZ1bmN0aW9uKHNoYWRvdykge1xuICAgICAgdmFyIG9zID0gc2hhZG93Lm9sZGVyU2hhZG93Um9vdDtcbiAgICAgIGlmICghb3MpIHtcbiAgICAgICAgdmFyIHNlID0gc2hhZG93LnF1ZXJ5U2VsZWN0b3IoJ3NoYWRvdycpO1xuICAgICAgICBpZiAoc2UpIHtcbiAgICAgICAgICBvcyA9IHNlLm9sZGVyU2hhZG93Um9vdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9zO1xuICAgIH0sXG4gICAgYWxsU2hhZG93czogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHNoYWRvd3MgPSBbXTtcbiAgICAgIHZhciBzID0gdGhpcy5zaGFkb3coZWxlbWVudCk7XG4gICAgICB3aGlsZSAocykge1xuICAgICAgICBzaGFkb3dzLnB1c2gocyk7XG4gICAgICAgIHMgPSB0aGlzLm9sZGVyU2hhZG93KHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNoYWRvd3M7XG4gICAgfSxcbiAgICBzZWFyY2hSb290OiBmdW5jdGlvbihpblJvb3QsIHgsIHkpIHtcbiAgICAgIGlmIChpblJvb3QpIHtcbiAgICAgICAgdmFyIHQgPSBpblJvb3QuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgdmFyIHN0LCBzcjtcblxuICAgICAgICAvLyBpcyBlbGVtZW50IGEgc2hhZG93IGhvc3Q/XG4gICAgICAgIHNyID0gdGhpcy50YXJnZXRpbmdTaGFkb3codCk7XG4gICAgICAgIHdoaWxlIChzcikge1xuXG4gICAgICAgICAgLy8gZmluZCB0aGUgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBzaGFkb3cgcm9vdFxuICAgICAgICAgIHN0ID0gc3IuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgICBpZiAoIXN0KSB7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBvbGRlciBzaGFkb3dzXG4gICAgICAgICAgICBzciA9IHRoaXMub2xkZXJTaGFkb3coc3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIHNoYWRvd2VkIGVsZW1lbnQgbWF5IGNvbnRhaW4gYSBzaGFkb3cgcm9vdFxuICAgICAgICAgICAgdmFyIHNzciA9IHRoaXMudGFyZ2V0aW5nU2hhZG93KHN0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaFJvb3Qoc3NyLCB4LCB5KSB8fCBzdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsaWdodCBkb20gZWxlbWVudCBpcyB0aGUgdGFyZ2V0XG4gICAgICAgIHJldHVybiB0O1xuICAgICAgfVxuICAgIH0sXG4gICAgb3duZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBzID0gZWxlbWVudDtcblxuICAgICAgLy8gd2FsayB1cCB1bnRpbCB5b3UgaGl0IHRoZSBzaGFkb3cgcm9vdCBvciBkb2N1bWVudFxuICAgICAgd2hpbGUgKHMucGFyZW50Tm9kZSkge1xuICAgICAgICBzID0gcy5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgb3duZXIgZWxlbWVudCBpcyBleHBlY3RlZCB0byBiZSBhIERvY3VtZW50IG9yIFNoYWRvd1Jvb3RcbiAgICAgIGlmIChzLm5vZGVUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX05PREUgJiYgcy5ub2RlVHlwZSAhPT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG4gICAgICAgIHMgPSBkb2N1bWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzO1xuICAgIH0sXG4gICAgZmluZFRhcmdldDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFg7XG4gICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WTtcblxuICAgICAgLy8gaWYgdGhlIGxpc3RlbmVyIGlzIGluIHRoZSBzaGFkb3cgcm9vdCwgaXQgaXMgbXVjaCBmYXN0ZXIgdG8gc3RhcnQgdGhlcmVcbiAgICAgIHZhciBzID0gdGhpcy5vd25lcihpbkV2ZW50LnRhcmdldCk7XG5cbiAgICAgIC8vIGlmIHgsIHkgaXMgbm90IGluIHRoaXMgcm9vdCwgZmFsbCBiYWNrIHRvIGRvY3VtZW50IHNlYXJjaFxuICAgICAgaWYgKCFzLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkpIHtcbiAgICAgICAgcyA9IGRvY3VtZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoUm9vdChzLCB4LCB5KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIHVzZXMgTXV0YXRpb24gT2JzZXJ2ZXJzIHRvIGR5bmFtaWNhbGx5IGFkanVzdCB3aGljaCBub2RlcyB3aWxsXG4gICAqIGdlbmVyYXRlIFBvaW50ZXIgRXZlbnRzLlxuICAgKlxuICAgKiBBbGwgbm9kZXMgdGhhdCB3aXNoIHRvIGdlbmVyYXRlIFBvaW50ZXIgRXZlbnRzIG11c3QgaGF2ZSB0aGUgYXR0cmlidXRlXG4gICAqIGB0b3VjaC1hY3Rpb25gIHNldCB0byBgbm9uZWAuXG4gICAqL1xuICB2YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCk7XG4gIHZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUubWFwKTtcbiAgdmFyIHRvQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG4gIHZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZmlsdGVyKTtcbiAgdmFyIE1PID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBTRUxFQ1RPUiA9ICdbdG91Y2gtYWN0aW9uXSc7XG4gIHZhciBPQlNFUlZFUl9JTklUID0ge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgYXR0cmlidXRlRmlsdGVyOiBbJ3RvdWNoLWFjdGlvbiddXG4gIH07XG5cbiAgZnVuY3Rpb24gSW5zdGFsbGVyKGFkZCwgcmVtb3ZlLCBjaGFuZ2VkLCBiaW5kZXIpIHtcbiAgICB0aGlzLmFkZENhbGxiYWNrID0gYWRkLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLnJlbW92ZUNhbGxiYWNrID0gcmVtb3ZlLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayA9IGNoYW5nZWQuYmluZChiaW5kZXIpO1xuICAgIGlmIChNTykge1xuICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNTyh0aGlzLm11dGF0aW9uV2F0Y2hlci5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBJbnN0YWxsZXIucHJvdG90eXBlID0ge1xuICAgIHdhdGNoU3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG5cbiAgICAgIC8vIE9ubHkgd2F0Y2ggc2NvcGVzIHRoYXQgY2FuIHRhcmdldCBmaW5kLCBhcyB0aGVzZSBhcmUgdG9wLWxldmVsLlxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbiBzZWUgZHVwbGljYXRlIGFkZGl0aW9ucyBhbmQgcmVtb3ZhbHMgdGhhdCBhZGQgbm9pc2UuXG4gICAgICAvL1xuICAgICAgLy8gVE9ETyhkZnJlZWRtYW4pOiBGb3Igc29tZSBpbnN0YW5jZXMgd2l0aCBTaGFkb3dET01Qb2x5ZmlsbCwgd2UgY2FuIHNlZVxuICAgICAgLy8gYSByZW1vdmFsIHdpdGhvdXQgYW4gaW5zZXJ0aW9uIHdoZW4gYSBub2RlIGlzIHJlZGlzdHJpYnV0ZWQgYW1vbmdcbiAgICAgIC8vIHNoYWRvd3MuIFNpbmNlIGl0IGFsbCBlbmRzIHVwIGNvcnJlY3QgaW4gdGhlIGRvY3VtZW50LCB3YXRjaGluZyBvbmx5XG4gICAgICAvLyB0aGUgZG9jdW1lbnQgd2lsbCB5aWVsZCB0aGUgY29ycmVjdCBtdXRhdGlvbnMgdG8gd2F0Y2guXG4gICAgICBpZiAodGhpcy5vYnNlcnZlciAmJiB0YXJnZXRpbmcuY2FuVGFyZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgT0JTRVJWRVJfSU5JVCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmFibGVPblN1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy53YXRjaFN1YnRyZWUodGFyZ2V0KTtcbiAgICAgIGlmICh0YXJnZXQgPT09IGRvY3VtZW50ICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsT25Mb2FkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluc3RhbGxOZXdTdWJ0cmVlKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnN0YWxsTmV3U3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBmb3JFYWNoKHRoaXMuZmluZEVsZW1lbnRzKHRhcmdldCksIHRoaXMuYWRkRWxlbWVudCwgdGhpcyk7XG4gICAgfSxcbiAgICBmaW5kRWxlbWVudHM6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUik7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcbiAgICByZW1vdmVFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5yZW1vdmVDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBhZGRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBlbGVtZW50Q2hhbmdlZDogZnVuY3Rpb24oZWwsIG9sZFZhbHVlKSB7XG4gICAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayhlbCwgb2xkVmFsdWUpO1xuICAgIH0sXG4gICAgY29uY2F0TGlzdHM6IGZ1bmN0aW9uKGFjY3VtLCBsaXN0KSB7XG4gICAgICByZXR1cm4gYWNjdW0uY29uY2F0KHRvQXJyYXkobGlzdCkpO1xuICAgIH0sXG5cbiAgICAvLyByZWdpc3RlciBhbGwgdG91Y2gtYWN0aW9uID0gbm9uZSBub2RlcyBvbiBkb2N1bWVudCBsb2FkXG4gICAgaW5zdGFsbE9uTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgdGhpcy5pbnN0YWxsTmV3U3VidHJlZShkb2N1bWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBpc0VsZW1lbnQ6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIHJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbiAgICB9LFxuICAgIGZsYXR0ZW5NdXRhdGlvblRyZWU6IGZ1bmN0aW9uKGluTm9kZXMpIHtcblxuICAgICAgLy8gZmluZCBjaGlsZHJlbiB3aXRoIHRvdWNoLWFjdGlvblxuICAgICAgdmFyIHRyZWUgPSBtYXAoaW5Ob2RlcywgdGhpcy5maW5kRWxlbWVudHMsIHRoaXMpO1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGFkZGVkIG5vZGVzIGFyZSBhY2NvdW50ZWQgZm9yXG4gICAgICB0cmVlLnB1c2goZmlsdGVyKGluTm9kZXMsIHRoaXMuaXNFbGVtZW50KSk7XG5cbiAgICAgIC8vIGZsYXR0ZW4gdGhlIGxpc3RcbiAgICAgIHJldHVybiB0cmVlLnJlZHVjZSh0aGlzLmNvbmNhdExpc3RzLCBbXSk7XG4gICAgfSxcbiAgICBtdXRhdGlvbldhdGNoZXI6IGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2godGhpcy5tdXRhdGlvbkhhbmRsZXIsIHRoaXMpO1xuICAgIH0sXG4gICAgbXV0YXRpb25IYW5kbGVyOiBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICB2YXIgYWRkZWQgPSB0aGlzLmZsYXR0ZW5NdXRhdGlvblRyZWUobS5hZGRlZE5vZGVzKTtcbiAgICAgICAgYWRkZWQuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnQsIHRoaXMpO1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IHRoaXMuZmxhdHRlbk11dGF0aW9uVHJlZShtLnJlbW92ZWROb2Rlcyk7XG4gICAgICAgIHJlbW92ZWQuZm9yRWFjaCh0aGlzLnJlbW92ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgfSBlbHNlIGlmIChtLnR5cGUgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICB0aGlzLmVsZW1lbnRDaGFuZ2VkKG0udGFyZ2V0LCBtLm9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGluc3RhbGxlciA9IEluc3RhbGxlcjtcblxuICBmdW5jdGlvbiBzaGFkb3dTZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdib2R5IC9zaGFkb3ctZGVlcC8gJyArIHNlbGVjdG9yKHYpO1xuICB9XG4gIGZ1bmN0aW9uIHNlbGVjdG9yKHYpIHtcbiAgICByZXR1cm4gJ1t0b3VjaC1hY3Rpb249XCInICsgdiArICdcIl0nO1xuICB9XG4gIGZ1bmN0aW9uIHJ1bGUodikge1xuICAgIHJldHVybiAneyAtbXMtdG91Y2gtYWN0aW9uOiAnICsgdiArICc7IHRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb24tZGVsYXk6IG5vbmU7IH0nO1xuICB9XG4gIHZhciBhdHRyaWIyY3NzID0gW1xuICAgICdub25lJyxcbiAgICAnYXV0bycsXG4gICAgJ3Bhbi14JyxcbiAgICAncGFuLXknLFxuICAgIHtcbiAgICAgIHJ1bGU6ICdwYW4teCBwYW4teScsXG4gICAgICBzZWxlY3RvcnM6IFtcbiAgICAgICAgJ3Bhbi14IHBhbi15JyxcbiAgICAgICAgJ3Bhbi15IHBhbi14J1xuICAgICAgXVxuICAgIH1cbiAgXTtcbiAgdmFyIHN0eWxlcyA9ICcnO1xuXG4gIC8vIG9ubHkgaW5zdGFsbCBzdHlsZXNoZWV0IGlmIHRoZSBicm93c2VyIGhhcyB0b3VjaCBhY3Rpb24gc3VwcG9ydFxuICB2YXIgaGFzTmF0aXZlUEUgPSB3aW5kb3cuUG9pbnRlckV2ZW50IHx8IHdpbmRvdy5NU1BvaW50ZXJFdmVudDtcblxuICAvLyBvbmx5IGFkZCBzaGFkb3cgc2VsZWN0b3JzIGlmIHNoYWRvd2RvbSBpcyBzdXBwb3J0ZWRcbiAgdmFyIGhhc1NoYWRvd1Jvb3QgPSAhd2luZG93LlNoYWRvd0RPTVBvbHlmaWxsICYmIGRvY3VtZW50LmhlYWQuY3JlYXRlU2hhZG93Um9vdDtcblxuICBmdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVN0eWxlcygpIHtcbiAgICBpZiAoaGFzTmF0aXZlUEUpIHtcbiAgICAgIGF0dHJpYjJjc3MuZm9yRWFjaChmdW5jdGlvbihyKSB7XG4gICAgICAgIGlmIChTdHJpbmcocikgPT09IHIpIHtcbiAgICAgICAgICBzdHlsZXMgKz0gc2VsZWN0b3IocikgKyBydWxlKHIpICsgJ1xcbic7XG4gICAgICAgICAgaWYgKGhhc1NoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIHN0eWxlcyArPSBzaGFkb3dTZWxlY3RvcihyKSArIHJ1bGUocikgKyAnXFxuJztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVzICs9IHIuc2VsZWN0b3JzLm1hcChzZWxlY3RvcikgKyBydWxlKHIucnVsZSkgKyAnXFxuJztcbiAgICAgICAgICBpZiAoaGFzU2hhZG93Um9vdCkge1xuICAgICAgICAgICAgc3R5bGVzICs9IHIuc2VsZWN0b3JzLm1hcChzaGFkb3dTZWxlY3RvcikgKyBydWxlKHIucnVsZSkgKyAnXFxuJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgZWwudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGVsKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbW91c2VfX3BvaW50ZXJtYXAgPSBfZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuXG4gIC8vIHJhZGl1cyBhcm91bmQgdG91Y2hlbmQgdGhhdCBzd2FsbG93cyBtb3VzZSBldmVudHNcbiAgdmFyIERFRFVQX0RJU1QgPSAyNTtcblxuICAvLyBsZWZ0LCBtaWRkbGUsIHJpZ2h0LCBiYWNrLCBmb3J3YXJkXG4gIHZhciBCVVRUT05fVE9fQlVUVE9OUyA9IFsxLCA0LCAyLCA4LCAxNl07XG5cbiAgdmFyIEhBU19CVVRUT05TID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgSEFTX0JVVFRPTlMgPSBuZXcgTW91c2VFdmVudCgndGVzdCcsIHsgYnV0dG9uczogMSB9KS5idXR0b25zID09PSAxO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIC8vIGhhbmRsZXIgYmxvY2sgZm9yIG5hdGl2ZSBtb3VzZSBldmVudHNcbiAgdmFyIG1vdXNlRXZlbnRzID0ge1xuICAgIFBPSU5URVJfSUQ6IDEsXG4gICAgUE9JTlRFUl9UWVBFOiAnbW91c2UnLFxuICAgIGV2ZW50czogW1xuICAgICAgJ21vdXNlZG93bicsXG4gICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW92ZXInLFxuICAgICAgJ21vdXNlb3V0J1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIGxhc3RUb3VjaGVzOiBbXSxcblxuICAgIC8vIGNvbGxpZGUgd2l0aCB0aGUgZ2xvYmFsIG1vdXNlIGxpc3RlbmVyXG4gICAgaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGx0cyA9IHRoaXMubGFzdFRvdWNoZXM7XG4gICAgICB2YXIgeCA9IGluRXZlbnQuY2xpZW50WDtcbiAgICAgIHZhciB5ID0gaW5FdmVudC5jbGllbnRZO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsdHMubGVuZ3RoLCB0OyBpIDwgbCAmJiAodCA9IGx0c1tpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIHNpbXVsYXRlZCBtb3VzZSBldmVudHMgd2lsbCBiZSBzd2FsbG93ZWQgbmVhciBhIHByaW1hcnkgdG91Y2hlbmRcbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMoeCAtIHQueCk7XG4gICAgICAgIHZhciBkeSA9IE1hdGguYWJzKHkgLSB0LnkpO1xuICAgICAgICBpZiAoZHggPD0gREVEVVBfRElTVCAmJiBkeSA8PSBERURVUF9ESVNUKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByZXBhcmVFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuXG4gICAgICAvLyBmb3J3YXJkIG1vdXNlIHByZXZlbnREZWZhdWx0XG4gICAgICB2YXIgcGQgPSBlLnByZXZlbnREZWZhdWx0O1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBkKCk7XG4gICAgICB9O1xuICAgICAgZS5wb2ludGVySWQgPSB0aGlzLlBPSU5URVJfSUQ7XG4gICAgICBlLmlzUHJpbWFyeSA9IHRydWU7XG4gICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEU7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByZXBhcmVCdXR0b25zRm9yTW92ZTogZnVuY3Rpb24oZSwgaW5FdmVudCkge1xuICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgIGUuYnV0dG9ucyA9IHAgPyBwLmJ1dHRvbnMgOiAwO1xuICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgIH0sXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgcCA9IG1vdXNlX19wb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7XG4gICAgICAgICAgZS5idXR0b25zID0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dO1xuICAgICAgICAgIGlmIChwKSB7IGUuYnV0dG9ucyB8PSBwLmJ1dHRvbnM7IH1cbiAgICAgICAgICBpbkV2ZW50LmJ1dHRvbnMgPSBlLmJ1dHRvbnM7XG4gICAgICAgIH1cbiAgICAgICAgbW91c2VfX3BvaW50ZXJtYXAuc2V0KHRoaXMuUE9JTlRFUl9JRCwgaW5FdmVudCk7XG4gICAgICAgIGlmICghcCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmRvd24oZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZXVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgcCA9IG1vdXNlX19wb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7XG4gICAgICAgICAgdmFyIHVwID0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dO1xuXG4gICAgICAgICAgLy8gUHJvZHVjZXMgd3Jvbmcgc3RhdGUgb2YgYnV0dG9ucyBpbiBCcm93c2VycyB3aXRob3V0IGBidXR0b25zYCBzdXBwb3J0XG4gICAgICAgICAgLy8gd2hlbiBhIG1vdXNlIGJ1dHRvbiB0aGF0IHdhcyBwcmVzc2VkIG91dHNpZGUgdGhlIGRvY3VtZW50IGlzIHJlbGVhc2VkXG4gICAgICAgICAgLy8gaW5zaWRlIGFuZCBvdGhlciBidXR0b25zIGFyZSBzdGlsbCBwcmVzc2VkIGRvd24uXG4gICAgICAgICAgZS5idXR0b25zID0gcCA/IHAuYnV0dG9ucyAmIH51cCA6IDA7XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIG1vdXNlX19wb2ludGVybWFwLnNldCh0aGlzLlBPSU5URVJfSUQsIGluRXZlbnQpO1xuXG4gICAgICAgIC8vIFN1cHBvcnQ6IEZpcmVmb3ggPD00NCBvbmx5XG4gICAgICAgIC8vIEZGIFVidW50dSBpbmNsdWRlcyB0aGUgbGlmdGVkIGJ1dHRvbiBpbiB0aGUgYGJ1dHRvbnNgIHByb3BlcnR5IG9uXG4gICAgICAgIC8vIG1vdXNldXAuXG4gICAgICAgIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEyMjMzNjZcbiAgICAgICAgaWYgKGUuYnV0dG9ucyA9PT0gMCB8fCBlLmJ1dHRvbnMgPT09IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXSkge1xuICAgICAgICAgIHRoaXMuY2xlYW51cE1vdXNlKCk7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIudXAoZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2VvdmVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlb3V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuY2FuY2VsKGUpO1xuICAgICAgdGhpcy5jbGVhbnVwTW91c2UoKTtcbiAgICB9LFxuICAgIGNsZWFudXBNb3VzZTogZnVuY3Rpb24oKSB7XG4gICAgICBtb3VzZV9fcG9pbnRlcm1hcC5kZWxldGUodGhpcy5QT0lOVEVSX0lEKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1vdXNlID0gbW91c2VFdmVudHM7XG5cbiAgdmFyIGNhcHR1cmVJbmZvID0gX2Rpc3BhdGNoZXIuY2FwdHVyZUluZm87XG4gIHZhciBmaW5kVGFyZ2V0ID0gdGFyZ2V0aW5nLmZpbmRUYXJnZXQuYmluZCh0YXJnZXRpbmcpO1xuICB2YXIgYWxsU2hhZG93cyA9IHRhcmdldGluZy5hbGxTaGFkb3dzLmJpbmQodGFyZ2V0aW5nKTtcbiAgdmFyIHRvdWNoX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcblxuICAvLyBUaGlzIHNob3VsZCBiZSBsb25nIGVub3VnaCB0byBpZ25vcmUgY29tcGF0IG1vdXNlIGV2ZW50cyBtYWRlIGJ5IHRvdWNoXG4gIHZhciBERURVUF9USU1FT1VUID0gMjUwMDtcbiAgdmFyIENMSUNLX0NPVU5UX1RJTUVPVVQgPSAyMDA7XG4gIHZhciBBVFRSSUIgPSAndG91Y2gtYWN0aW9uJztcbiAgdmFyIElOU1RBTExFUjtcblxuICAvLyBUaGUgcHJlc2VuY2Ugb2YgdG91Y2ggZXZlbnQgaGFuZGxlcnMgYmxvY2tzIHNjcm9sbGluZywgYW5kIHNvIHdlIG11c3QgYmUgY2FyZWZ1bCB0b1xuICAvLyBhdm9pZCBhZGRpbmcgaGFuZGxlcnMgdW5uZWNlc3NhcmlseS4gIENocm9tZSBwbGFucyB0byBhZGQgYSB0b3VjaC1hY3Rpb24tZGVsYXkgcHJvcGVydHlcbiAgLy8gKGNyYnVnLmNvbS8zMjk1NTkpIHRvIGFkZHJlc3MgdGhpcywgYW5kIG9uY2Ugd2UgaGF2ZSB0aGF0IHdlIGNhbiBvcHQtaW4gdG8gYSBzaW1wbGVyXG4gIC8vIGhhbmRsZXIgcmVnaXN0cmF0aW9uIG1lY2hhbmlzbS4gIFJhdGhlciB0aGFuIHRyeSB0byBwcmVkaWN0IGhvdyBleGFjdGx5IHRvIG9wdC1pbiB0b1xuICAvLyB0aGF0IHdlJ2xsIGp1c3QgbGVhdmUgdGhpcyBkaXNhYmxlZCB1bnRpbCB0aGVyZSBpcyBhIGJ1aWxkIG9mIENocm9tZSB0byB0ZXN0LlxuICB2YXIgSEFTX1RPVUNIX0FDVElPTl9ERUxBWSA9IGZhbHNlO1xuXG4gIC8vIGhhbmRsZXIgYmxvY2sgZm9yIG5hdGl2ZSB0b3VjaCBldmVudHNcbiAgdmFyIHRvdWNoRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAndG91Y2hlbmQnLFxuICAgICAgJ3RvdWNoY2FuY2VsJ1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKEhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgSU5TVEFMTEVSLmVuYWJsZU9uU3VidHJlZSh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAoSEFTX1RPVUNIX0FDVElPTl9ERUxBWSkge1xuICAgICAgICBfZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETyhkZnJlZWRtYW4pOiBpcyBpdCB3b3J0aCBpdCB0byBkaXNjb25uZWN0IHRoZSBNTz9cbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRBZGRlZDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBhID0gZWwuZ2V0QXR0cmlidXRlKEFUVFJJQik7XG4gICAgICB2YXIgc3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKGEpO1xuICAgICAgaWYgKHN0KSB7XG4gICAgICAgIGVsLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxpc3RlbihlbCwgdGhpcy5ldmVudHMpO1xuXG4gICAgICAgIC8vIHNldCB0b3VjaC1hY3Rpb24gb24gc2hhZG93cyBhcyB3ZWxsXG4gICAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgIHMuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5saXN0ZW4ocywgdGhpcy5ldmVudHMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRSZW1vdmVkOiBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuX3Njcm9sbFR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICBfZGlzcGF0Y2hlci51bmxpc3RlbihlbCwgdGhpcy5ldmVudHMpO1xuXG4gICAgICAvLyByZW1vdmUgdG91Y2gtYWN0aW9uIGZyb20gc2hhZG93XG4gICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcy5fc2Nyb2xsVHlwZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4ocywgdGhpcy5ldmVudHMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcbiAgICBlbGVtZW50Q2hhbmdlZDogZnVuY3Rpb24oZWwsIG9sZFZhbHVlKSB7XG4gICAgICB2YXIgYSA9IGVsLmdldEF0dHJpYnV0ZShBVFRSSUIpO1xuICAgICAgdmFyIHN0ID0gdGhpcy50b3VjaEFjdGlvblRvU2Nyb2xsVHlwZShhKTtcbiAgICAgIHZhciBvbGRTdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUob2xkVmFsdWUpO1xuXG4gICAgICAvLyBzaW1wbHkgdXBkYXRlIHNjcm9sbFR5cGUgaWYgbGlzdGVuZXJzIGFyZSBhbHJlYWR5IGVzdGFibGlzaGVkXG4gICAgICBpZiAoc3QgJiYgb2xkU3QpIHtcbiAgICAgICAgZWwuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgYWxsU2hhZG93cyhlbCkuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcy5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAob2xkU3QpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50UmVtb3ZlZChlbCk7XG4gICAgICB9IGVsc2UgaWYgKHN0KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudEFkZGVkKGVsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbFR5cGVzOiB7XG4gICAgICBFTUlUVEVSOiAnbm9uZScsXG4gICAgICBYU0NST0xMRVI6ICdwYW4teCcsXG4gICAgICBZU0NST0xMRVI6ICdwYW4teScsXG4gICAgICBTQ1JPTExFUjogL14oPzpwYW4teCBwYW4teSl8KD86cGFuLXkgcGFuLXgpfGF1dG8kL1xuICAgIH0sXG4gICAgdG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGU6IGZ1bmN0aW9uKHRvdWNoQWN0aW9uKSB7XG4gICAgICB2YXIgdCA9IHRvdWNoQWN0aW9uO1xuICAgICAgdmFyIHN0ID0gdGhpcy5zY3JvbGxUeXBlcztcbiAgICAgIGlmICh0ID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuICdub25lJztcbiAgICAgIH0gZWxzZSBpZiAodCA9PT0gc3QuWFNDUk9MTEVSKSB7XG4gICAgICAgIHJldHVybiAnWCc7XG4gICAgICB9IGVsc2UgaWYgKHQgPT09IHN0LllTQ1JPTExFUikge1xuICAgICAgICByZXR1cm4gJ1knO1xuICAgICAgfSBlbHNlIGlmIChzdC5TQ1JPTExFUi5leGVjKHQpKSB7XG4gICAgICAgIHJldHVybiAnWFknO1xuICAgICAgfVxuICAgIH0sXG4gICAgUE9JTlRFUl9UWVBFOiAndG91Y2gnLFxuICAgIGZpcnN0VG91Y2g6IG51bGwsXG4gICAgaXNQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0VG91Y2ggPT09IGluVG91Y2guaWRlbnRpZmllcjtcbiAgICB9LFxuICAgIHNldFByaW1hcnlUb3VjaDogZnVuY3Rpb24oaW5Ub3VjaCkge1xuXG4gICAgICAvLyBzZXQgcHJpbWFyeSB0b3VjaCBpZiB0aGVyZSBubyBwb2ludGVycywgb3IgdGhlIG9ubHkgcG9pbnRlciBpcyB0aGUgbW91c2VcbiAgICAgIGlmICh0b3VjaF9fcG9pbnRlcm1hcC5zaXplID09PSAwIHx8ICh0b3VjaF9fcG9pbnRlcm1hcC5zaXplID09PSAxICYmIHRvdWNoX19wb2ludGVybWFwLmhhcygxKSkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gaW5Ub3VjaC5pZGVudGlmaWVyO1xuICAgICAgICB0aGlzLmZpcnN0WFkgPSB7IFg6IGluVG91Y2guY2xpZW50WCwgWTogaW5Ub3VjaC5jbGllbnRZIH07XG4gICAgICAgIHRoaXMuc2Nyb2xsaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsUmVzZXRDbGlja0NvdW50KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQcmltYXJ5UG9pbnRlcjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBpZiAoaW5Qb2ludGVyLmlzUHJpbWFyeSkge1xuICAgICAgICB0aGlzLmZpcnN0VG91Y2ggPSBudWxsO1xuICAgICAgICB0aGlzLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2xpY2tDb3VudDogMCxcbiAgICByZXNldElkOiBudWxsLFxuICAgIHJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbGlja0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5yZXNldElkID0gbnVsbDtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgIHRoaXMucmVzZXRJZCA9IHNldFRpbWVvdXQoZm4sIENMSUNLX0NPVU5UX1RJTUVPVVQpO1xuICAgIH0sXG4gICAgY2FuY2VsUmVzZXRDbGlja0NvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnJlc2V0SWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzZXRJZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0eXBlVG9CdXR0b25zOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICB2YXIgcmV0ID0gMDtcbiAgICAgIGlmICh0eXBlID09PSAndG91Y2hzdGFydCcgfHwgdHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgcmV0ID0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICB0b3VjaFRvUG9pbnRlcjogZnVuY3Rpb24oaW5Ub3VjaCkge1xuICAgICAgdmFyIGN0ZSA9IHRoaXMuY3VycmVudFRvdWNoRXZlbnQ7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5Ub3VjaCk7XG5cbiAgICAgIC8vIFdlIHJlc2VydmUgcG9pbnRlcklkIDEgZm9yIE1vdXNlLlxuICAgICAgLy8gVG91Y2ggaWRlbnRpZmllcnMgY2FuIHN0YXJ0IGF0IDAuXG4gICAgICAvLyBBZGQgMiB0byB0aGUgdG91Y2ggaWRlbnRpZmllciBmb3IgY29tcGF0aWJpbGl0eS5cbiAgICAgIHZhciBpZCA9IGUucG9pbnRlcklkID0gaW5Ub3VjaC5pZGVudGlmaWVyICsgMjtcbiAgICAgIGUudGFyZ2V0ID0gY2FwdHVyZUluZm9baWRdIHx8IGZpbmRUYXJnZXQoZSk7XG4gICAgICBlLmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgZS5jYW5jZWxhYmxlID0gdHJ1ZTtcbiAgICAgIGUuZGV0YWlsID0gdGhpcy5jbGlja0NvdW50O1xuICAgICAgZS5idXR0b24gPSAwO1xuICAgICAgZS5idXR0b25zID0gdGhpcy50eXBlVG9CdXR0b25zKGN0ZS50eXBlKTtcbiAgICAgIGUud2lkdGggPSBpblRvdWNoLnJhZGl1c1ggfHwgaW5Ub3VjaC53ZWJraXRSYWRpdXNYIHx8IDA7XG4gICAgICBlLmhlaWdodCA9IGluVG91Y2gucmFkaXVzWSB8fCBpblRvdWNoLndlYmtpdFJhZGl1c1kgfHwgMDtcbiAgICAgIGUucHJlc3N1cmUgPSBpblRvdWNoLmZvcmNlIHx8IGluVG91Y2gud2Via2l0Rm9yY2UgfHwgMC41O1xuICAgICAgZS5pc1ByaW1hcnkgPSB0aGlzLmlzUHJpbWFyeVRvdWNoKGluVG91Y2gpO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuXG4gICAgICAvLyBmb3J3YXJkIHRvdWNoIHByZXZlbnREZWZhdWx0c1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICBjdGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByb2Nlc3NUb3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50LCBpbkZ1bmN0aW9uKSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgdGhpcy5jdXJyZW50VG91Y2hFdmVudCA9IGluRXZlbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMCwgdDsgaSA8IHRsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHQgPSB0bFtpXTtcbiAgICAgICAgaW5GdW5jdGlvbi5jYWxsKHRoaXMsIHRoaXMudG91Y2hUb1BvaW50ZXIodCkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBGb3Igc2luZ2xlIGF4aXMgc2Nyb2xsZXJzLCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVsZW1lbnQgc2hvdWxkIGVtaXRcbiAgICAvLyBwb2ludGVyIGV2ZW50cyBvciBiZWhhdmUgYXMgYSBzY3JvbGxlclxuICAgIHNob3VsZFNjcm9sbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKHRoaXMuZmlyc3RYWSkge1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICB2YXIgc2Nyb2xsQXhpcyA9IGluRXZlbnQuY3VycmVudFRhcmdldC5fc2Nyb2xsVHlwZTtcbiAgICAgICAgaWYgKHNjcm9sbEF4aXMgPT09ICdub25lJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IGlzIGEgdG91Y2gtYWN0aW9uOiBub25lLCBzaG91bGQgbmV2ZXIgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsQXhpcyA9PT0gJ1hZJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IHNob3VsZCBhbHdheXMgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICAgICAgICAvLyBjaGVjayB0aGUgaW50ZW5kZWQgc2Nyb2xsIGF4aXMsIGFuZCBvdGhlciBheGlzXG4gICAgICAgICAgdmFyIGEgPSBzY3JvbGxBeGlzO1xuICAgICAgICAgIHZhciBvYSA9IHNjcm9sbEF4aXMgPT09ICdZJyA/ICdYJyA6ICdZJztcbiAgICAgICAgICB2YXIgZGEgPSBNYXRoLmFicyh0WydjbGllbnQnICsgYV0gLSB0aGlzLmZpcnN0WFlbYV0pO1xuICAgICAgICAgIHZhciBkb2EgPSBNYXRoLmFicyh0WydjbGllbnQnICsgb2FdIC0gdGhpcy5maXJzdFhZW29hXSk7XG5cbiAgICAgICAgICAvLyBpZiBkZWx0YSBpbiB0aGUgc2Nyb2xsIGF4aXMgPiBkZWx0YSBvdGhlciBheGlzLCBzY3JvbGwgaW5zdGVhZCBvZlxuICAgICAgICAgIC8vIG1ha2luZyBldmVudHNcbiAgICAgICAgICByZXQgPSBkYSA+PSBkb2E7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZpbmRUb3VjaDogZnVuY3Rpb24oaW5UTCwgaW5JZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpblRMLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBpblRMW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0LmlkZW50aWZpZXIgPT09IGluSWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBJbiBzb21lIGluc3RhbmNlcywgYSB0b3VjaHN0YXJ0IGNhbiBoYXBwZW4gd2l0aG91dCBhIHRvdWNoZW5kLiBUaGlzXG4gICAgLy8gbGVhdmVzIHRoZSBwb2ludGVybWFwIGluIGEgYnJva2VuIHN0YXRlLlxuICAgIC8vIFRoZXJlZm9yZSwgb24gZXZlcnkgdG91Y2hzdGFydCwgd2UgcmVtb3ZlIHRoZSB0b3VjaGVzIHRoYXQgZGlkIG5vdCBmaXJlIGFcbiAgICAvLyB0b3VjaGVuZCBldmVudC5cbiAgICAvLyBUbyBrZWVwIHN0YXRlIGdsb2JhbGx5IGNvbnNpc3RlbnQsIHdlIGZpcmUgYVxuICAgIC8vIHBvaW50ZXJjYW5jZWwgZm9yIHRoaXMgXCJhYmFuZG9uZWRcIiB0b3VjaFxuICAgIHZhY3V1bVRvdWNoZXM6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB0bCA9IGluRXZlbnQudG91Y2hlcztcblxuICAgICAgLy8gcG9pbnRlcm1hcC5zaXplIHNob3VsZCBiZSA8IHRsLmxlbmd0aCBoZXJlLCBhcyB0aGUgdG91Y2hzdGFydCBoYXMgbm90XG4gICAgICAvLyBiZWVuIHByb2Nlc3NlZCB5ZXQuXG4gICAgICBpZiAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA+PSB0bC5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGQgPSBbXTtcbiAgICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG5cbiAgICAgICAgICAvLyBOZXZlciByZW1vdmUgcG9pbnRlcklkID09IDEsIHdoaWNoIGlzIG1vdXNlLlxuICAgICAgICAgIC8vIFRvdWNoIGlkZW50aWZpZXJzIGFyZSAyIHNtYWxsZXIgdGhhbiB0aGVpciBwb2ludGVySWQsIHdoaWNoIGlzIHRoZVxuICAgICAgICAgIC8vIGluZGV4IGluIHBvaW50ZXJtYXAuXG4gICAgICAgICAgaWYgKGtleSAhPT0gMSAmJiAhdGhpcy5maW5kVG91Y2godGwsIGtleSAtIDIpKSB7XG4gICAgICAgICAgICB2YXIgcCA9IHZhbHVlLm91dDtcbiAgICAgICAgICAgIGQucHVzaChwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBkLmZvckVhY2godGhpcy5jYW5jZWxPdXQsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG91Y2hzdGFydDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy52YWN1dW1Ub3VjaGVzKGluRXZlbnQpO1xuICAgICAgdGhpcy5zZXRQcmltYXJ5VG91Y2goaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXSk7XG4gICAgICB0aGlzLmRlZHVwU3ludGhNb3VzZShpbkV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgdGhpcy5jbGlja0NvdW50Kys7XG4gICAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5vdmVyRG93bik7XG4gICAgICB9XG4gICAgfSxcbiAgICBvdmVyRG93bjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB0b3VjaF9fcG9pbnRlcm1hcC5zZXQoaW5Qb2ludGVyLnBvaW50ZXJJZCwge1xuICAgICAgICB0YXJnZXQ6IGluUG9pbnRlci50YXJnZXQsXG4gICAgICAgIG91dDogaW5Qb2ludGVyLFxuICAgICAgICBvdXRUYXJnZXQ6IGluUG9pbnRlci50YXJnZXRcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoZXIub3ZlcihpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIuZW50ZXIoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmRvd24oaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIHRvdWNobW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRTY3JvbGwoaW5FdmVudCkpIHtcbiAgICAgICAgICB0aGlzLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy50b3VjaGNhbmNlbChpbkV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLm1vdmVPdmVyT3V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZU92ZXJPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdmFyIGV2ZW50ID0gaW5Qb2ludGVyO1xuICAgICAgdmFyIHBvaW50ZXIgPSB0b3VjaF9fcG9pbnRlcm1hcC5nZXQoZXZlbnQucG9pbnRlcklkKTtcblxuICAgICAgLy8gYSBmaW5nZXIgZHJpZnRlZCBvZmYgdGhlIHNjcmVlbiwgaWdub3JlIGl0XG4gICAgICBpZiAoIXBvaW50ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG91dEV2ZW50ID0gcG9pbnRlci5vdXQ7XG4gICAgICB2YXIgb3V0VGFyZ2V0ID0gcG9pbnRlci5vdXRUYXJnZXQ7XG4gICAgICBfZGlzcGF0Y2hlci5tb3ZlKGV2ZW50KTtcbiAgICAgIGlmIChvdXRFdmVudCAmJiBvdXRUYXJnZXQgIT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICBvdXRFdmVudC5yZWxhdGVkVGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBldmVudC5yZWxhdGVkVGFyZ2V0ID0gb3V0VGFyZ2V0O1xuXG4gICAgICAgIC8vIHJlY292ZXIgZnJvbSByZXRhcmdldGluZyBieSBzaGFkb3dcbiAgICAgICAgb3V0RXZlbnQudGFyZ2V0ID0gb3V0VGFyZ2V0O1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubGVhdmVPdXQob3V0RXZlbnQpO1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihldmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAvLyBjbGVhbiB1cCBjYXNlIHdoZW4gZmluZ2VyIGxlYXZlcyB0aGUgc2NyZWVuXG4gICAgICAgICAgZXZlbnQudGFyZ2V0ID0gb3V0VGFyZ2V0O1xuICAgICAgICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuY2FuY2VsT3V0KGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9pbnRlci5vdXQgPSBldmVudDtcbiAgICAgIHBvaW50ZXIub3V0VGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIH0sXG4gICAgdG91Y2hlbmQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLnVwT3V0KTtcbiAgICB9LFxuICAgIHVwT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIudXAoaW5Qb2ludGVyKTtcbiAgICAgICAgX2Rpc3BhdGNoZXIub3V0KGluUG9pbnRlcik7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlKGluUG9pbnRlcik7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFuVXBQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICB0b3VjaGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLmNhbmNlbE91dCk7XG4gICAgfSxcbiAgICBjYW5jZWxPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgX2Rpc3BhdGNoZXIuY2FuY2VsKGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5vdXQoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmxlYXZlKGluUG9pbnRlcik7XG4gICAgICB0aGlzLmNsZWFuVXBQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICBjbGVhblVwUG9pbnRlcjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB0b3VjaF9fcG9pbnRlcm1hcC5kZWxldGUoaW5Qb2ludGVyLnBvaW50ZXJJZCk7XG4gICAgICB0aGlzLnJlbW92ZVByaW1hcnlQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcblxuICAgIC8vIHByZXZlbnQgc3ludGggbW91c2UgZXZlbnRzIGZyb20gY3JlYXRpbmcgcG9pbnRlciBldmVudHNcbiAgICBkZWR1cFN5bnRoTW91c2U6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSBtb3VzZS5sYXN0VG91Y2hlcztcbiAgICAgIHZhciB0ID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgICAgLy8gb25seSB0aGUgcHJpbWFyeSBmaW5nZXIgd2lsbCBzeW50aCBtb3VzZSBldmVudHNcbiAgICAgIGlmICh0aGlzLmlzUHJpbWFyeVRvdWNoKHQpKSB7XG5cbiAgICAgICAgLy8gcmVtZW1iZXIgeC95IG9mIGxhc3QgdG91Y2hcbiAgICAgICAgdmFyIGx0ID0geyB4OiB0LmNsaWVudFgsIHk6IHQuY2xpZW50WSB9O1xuICAgICAgICBsdHMucHVzaChsdCk7XG4gICAgICAgIHZhciBmbiA9IChmdW5jdGlvbihsdHMsIGx0KSB7XG4gICAgICAgICAgdmFyIGkgPSBsdHMuaW5kZXhPZihsdCk7XG4gICAgICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICAgICAgbHRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQobnVsbCwgbHRzLCBsdCk7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIERFRFVQX1RJTUVPVVQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBpZiAoIUhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICBJTlNUQUxMRVIgPSBuZXcgaW5zdGFsbGVyKHRvdWNoRXZlbnRzLmVsZW1lbnRBZGRlZCwgdG91Y2hFdmVudHMuZWxlbWVudFJlbW92ZWQsXG4gICAgICB0b3VjaEV2ZW50cy5lbGVtZW50Q2hhbmdlZCwgdG91Y2hFdmVudHMpO1xuICB9XG5cbiAgdmFyIHRvdWNoID0gdG91Y2hFdmVudHM7XG5cbiAgdmFyIG1zX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcbiAgdmFyIEhBU19CSVRNQVBfVFlQRSA9IHdpbmRvdy5NU1BvaW50ZXJFdmVudCAmJlxuICAgIHR5cGVvZiB3aW5kb3cuTVNQb2ludGVyRXZlbnQuTVNQT0lOVEVSX1RZUEVfTU9VU0UgPT09ICdudW1iZXInO1xuICB2YXIgbXNFdmVudHMgPSB7XG4gICAgZXZlbnRzOiBbXG4gICAgICAnTVNQb2ludGVyRG93bicsXG4gICAgICAnTVNQb2ludGVyTW92ZScsXG4gICAgICAnTVNQb2ludGVyVXAnLFxuICAgICAgJ01TUG9pbnRlck91dCcsXG4gICAgICAnTVNQb2ludGVyT3ZlcicsXG4gICAgICAnTVNQb2ludGVyQ2FuY2VsJyxcbiAgICAgICdNU0dvdFBvaW50ZXJDYXB0dXJlJyxcbiAgICAgICdNU0xvc3RQb2ludGVyQ2FwdHVyZSdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBQT0lOVEVSX1RZUEVTOiBbXG4gICAgICAnJyxcbiAgICAgICd1bmF2YWlsYWJsZScsXG4gICAgICAndG91Y2gnLFxuICAgICAgJ3BlbicsXG4gICAgICAnbW91c2UnXG4gICAgXSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gaW5FdmVudDtcbiAgICAgIGlmIChIQVNfQklUTUFQX1RZUEUpIHtcbiAgICAgICAgZSA9IF9kaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRVNbaW5FdmVudC5wb2ludGVyVHlwZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIGNsZWFudXA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBtc19fcG9pbnRlcm1hcC5kZWxldGUoaWQpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyRG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgbXNfX3BvaW50ZXJtYXAuc2V0KGluRXZlbnQucG9pbnRlcklkLCBpbkV2ZW50KTtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyTW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJVcDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLnVwKGUpO1xuICAgICAgdGhpcy5jbGVhbnVwKGluRXZlbnQucG9pbnRlcklkKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyT3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlckNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU0xvc3RQb2ludGVyQ2FwdHVyZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5tYWtlRXZlbnQoJ2xvc3Rwb2ludGVyY2FwdHVyZScsIGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIE1TR290UG9pbnRlckNhcHR1cmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIubWFrZUV2ZW50KCdnb3Rwb2ludGVyY2FwdHVyZScsIGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1zID0gbXNFdmVudHM7XG5cbiAgZnVuY3Rpb24gcGxhdGZvcm1fZXZlbnRzX19hcHBseVBvbHlmaWxsKCkge1xuXG4gICAgLy8gb25seSBhY3RpdmF0ZSBpZiB0aGlzIHBsYXRmb3JtIGRvZXMgbm90IGhhdmUgcG9pbnRlciBldmVudHNcbiAgICBpZiAoIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICAgIHdpbmRvdy5Qb2ludGVyRXZlbnQgPSBfUG9pbnRlckV2ZW50O1xuXG4gICAgICBpZiAod2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgICAgIHZhciB0cCA9IHdpbmRvdy5uYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5uYXZpZ2F0b3IsICdtYXhUb3VjaFBvaW50cycsIHtcbiAgICAgICAgICB2YWx1ZTogdHAsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ21zJywgbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ21vdXNlJywgbW91c2UpO1xuICAgICAgICBpZiAod2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ3RvdWNoJywgdG91Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyKGRvY3VtZW50KTtcbiAgICB9XG4gIH1cblxuICB2YXIgbiA9IHdpbmRvdy5uYXZpZ2F0b3I7XG4gIHZhciBzLCByO1xuICBmdW5jdGlvbiBhc3NlcnREb3duKGlkKSB7XG4gICAgaWYgKCFfZGlzcGF0Y2hlci5wb2ludGVybWFwLmhhcyhpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZFBvaW50ZXJJZCcpO1xuICAgIH1cbiAgfVxuICBpZiAobi5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgcyA9IGZ1bmN0aW9uKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgdGhpcy5tc1NldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG4gICAgfTtcbiAgICByID0gZnVuY3Rpb24ocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICB0aGlzLm1zUmVsZWFzZVBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBzID0gZnVuY3Rpb24gc2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICBfZGlzcGF0Y2hlci5zZXRDYXB0dXJlKHBvaW50ZXJJZCwgdGhpcyk7XG4gICAgfTtcbiAgICByID0gZnVuY3Rpb24gcmVsZWFzZVBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgX2Rpc3BhdGNoZXIucmVsZWFzZUNhcHR1cmUocG9pbnRlcklkLCB0aGlzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gX2NhcHR1cmVfX2FwcGx5UG9seWZpbGwoKSB7XG4gICAgaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5zZXRQb2ludGVyQ2FwdHVyZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRWxlbWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgJ3NldFBvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIH0sXG4gICAgICAgICdyZWxlYXNlUG9pbnRlckNhcHR1cmUnOiB7XG4gICAgICAgICAgdmFsdWU6IHJcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXBwbHlBdHRyaWJ1dGVTdHlsZXMoKTtcbiAgcGxhdGZvcm1fZXZlbnRzX19hcHBseVBvbHlmaWxsKCk7XG4gIF9jYXB0dXJlX19hcHBseVBvbHlmaWxsKCk7XG5cbiAgdmFyIHBvaW50ZXJldmVudHMgPSB7XG4gICAgZGlzcGF0Y2hlcjogX2Rpc3BhdGNoZXIsXG4gICAgSW5zdGFsbGVyOiBpbnN0YWxsZXIsXG4gICAgUG9pbnRlckV2ZW50OiBfUG9pbnRlckV2ZW50LFxuICAgIFBvaW50ZXJNYXA6IF9wb2ludGVybWFwLFxuICAgIHRhcmdldEZpbmRpbmc6IHRhcmdldGluZ1xuICB9O1xuXG4gIHJldHVybiBwb2ludGVyZXZlbnRzO1xuXG59KSk7IiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVmljdG9yO1xuXG4vKipcbiAqICMgVmljdG9yIC0gQSBKYXZhU2NyaXB0IDJEIHZlY3RvciBjbGFzcyB3aXRoIG1ldGhvZHMgZm9yIGNvbW1vbiB2ZWN0b3Igb3BlcmF0aW9uc1xuICovXG5cbi8qKlxuICogQ29uc3RydWN0b3IuIFdpbGwgYWxzbyB3b3JrIHdpdGhvdXQgdGhlIGBuZXdgIGtleXdvcmRcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gVmljdG9yKDQyLCAxMzM3KTtcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBWYWx1ZSBvZiB0aGUgeCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0geSBWYWx1ZSBvZiB0aGUgeSBheGlzXG4gKiBAcmV0dXJuIHtWaWN0b3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBWaWN0b3IgKHgsIHkpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFZpY3RvcikpIHtcblx0XHRyZXR1cm4gbmV3IFZpY3Rvcih4LCB5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgWCBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLng7XG5cdCAqICAgICAvLyA9PiA0MlxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy54ID0geCB8fCAwO1xuXG5cdC8qKlxuXHQgKiBUaGUgWSBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLnk7XG5cdCAqICAgICAvLyA9PiAyMVxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy55ID0geSB8fCAwO1xufTtcblxuLyoqXG4gKiAjIFN0YXRpY1xuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBmcm9tIGFuIGFycmF5XG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBWaWN0b3IuZnJvbUFycmF5KFs0MiwgMjFdKTtcbiAqXG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo0MiwgeToyMVxuICpcbiAqIEBuYW1lIFZpY3Rvci5mcm9tQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IHdpdGggdGhlIHggYW5kIHkgdmFsdWVzIGF0IGluZGV4IDAgYW5kIDEgcmVzcGVjdGl2ZWx5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IFRoZSBuZXcgaW5zdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKGFyclswXSB8fCAwLCBhcnJbMV0gfHwgMCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IFZpY3Rvci5mcm9tT2JqZWN0KHsgeDogNDIsIHk6IDIxIH0pO1xuICpcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjQyLCB5OjIxXG4gKlxuICogQG5hbWUgVmljdG9yLmZyb21PYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogT2JqZWN0IHdpdGggdGhlIHZhbHVlcyBmb3IgeCBhbmQgeVxuICogQHJldHVybiB7VmljdG9yfSBUaGUgbmV3IGluc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IuZnJvbU9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0cmV0dXJuIG5ldyBWaWN0b3Iob2JqLnggfHwgMCwgb2JqLnkgfHwgMCk7XG59O1xuXG4vKipcbiAqICMgTWFuaXB1bGF0aW9uXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGFyZSBjaGFpbmFibGUuXG4gKi9cblxuLyoqXG4gKiBBZGRzIGFub3RoZXIgdmVjdG9yJ3MgWCBheGlzIHRvIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLmFkZFgodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6MTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCArPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW5vdGhlciB2ZWN0b3IncyBZIGF4aXMgdG8gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuYWRkWSh2ZWMyKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeTo0MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCB0byBhZGQgdG8gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkWSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy55ICs9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbm90aGVyIHZlY3RvciB0byB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5hZGQodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6NDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54ICs9IHZlYy54O1xuXHR0aGlzLnkgKz0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gYm90aCB2ZWN0b3IgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAzLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCArPSBzY2FsYXI7XG5cdHRoaXMueSArPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhclgoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMywgeTogMlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54ICs9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGdpdmVuIHNjYWxhciB0byB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEsIDIpO1xuICpcbiAqICAgICB2ZWMuYWRkU2NhbGFyWSgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAxLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgKz0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBYIGF4aXMgb2YgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3RYKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjgwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggLT0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIFkgYXhpcyBvZiBhbm90aGVyIHZlY3RvciBmcm9tIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5zdWJ0cmFjdFkodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjIwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RZID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3QodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6ODAsIHk6MjBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgc3VidHJhY3QgZnJvbSB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54IC09IHZlYy54O1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHNjYWxhciBmcm9tIGJvdGggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhcigyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogODAsIHk6IDE4MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBzdWJ0cmFjdFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdFNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54IC09IHNjYWxhcjtcblx0dGhpcy55IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgZ2l2ZW4gc2NhbGFyIGZyb20gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhclgoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDgwLCB5OiAyMDBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBnaXZlbiBzY2FsYXIgZnJvbSB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMjAwKTtcbiAqXG4gKiAgICAgdmVjLnN1YnRyYWN0U2NhbGFyWSgyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMTAwLCB5OiAxODBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSB4IGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlWCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVYID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggLz0gdmVjdG9yLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIHRoZSBZIGF4aXMgYnkgdGhlIHkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5kaXZpZGVZKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgYSBheGlzIHZhbHVlcyBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6MjVcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54IC89IHZlY3Rvci54O1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhciB2YWx1ZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZVNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdFx0dGhpcy55IC89IHNjYWxhcjtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnggPSAwO1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJYKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gVGhlIHNjYWxhciB0byBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy54ID0gMDtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJZKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnkgLz0gc2NhbGFyO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFgoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4Oi0xMDAsIHk6NTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFggPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueCAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFkoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTotNTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFkgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueSAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgYm90aCBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuaW52ZXJ0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDotMTAwLCB5Oi01MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmludmVydFgoKTtcblx0dGhpcy5pbnZlcnRZKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgWCBjb21wb25lbnQgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5WCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5WCA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54ICo9IHZlY3Rvci54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IFkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgKj0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdmFsdWVzIGZyb20gYSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHkodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggKj0gdmVjdG9yLng7XG5cdHRoaXMueSAqPSB2ZWN0b3IueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgYm90aCB2ZWN0b3IgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCAqPSBzY2FsYXI7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5U2NhbGFyWCgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVNjYWxhclkoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIGF4aXMgd2l0aFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemVcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0aWYgKGxlbmd0aCA9PT0gMCkge1xuXHRcdHRoaXMueCA9IDE7XG5cdFx0dGhpcy55ID0gMDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmRpdmlkZShWaWN0b3IobGVuZ3RoLCBsZW5ndGgpKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUubm9ybSA9IFZpY3Rvci5wcm90b3R5cGUubm9ybWFsaXplO1xuXG4vKipcbiAqIElmIHRoZSBhYnNvbHV0ZSB2ZWN0b3IgYXhpcyBpcyBncmVhdGVyIHRoYW4gYG1heGAsIG11bHRpcGxpZXMgdGhlIGF4aXMgYnkgYGZhY3RvcmBcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5saW1pdCg4MCwgMC45KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjkwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1heCBUaGUgbWF4aW11bSB2YWx1ZSBmb3IgYm90aCB4IGFuZCB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBmYWN0b3IgRmFjdG9yIGJ5IHdoaWNoIHRoZSBheGlzIGFyZSB0byBiZSBtdWx0aXBsaWVkIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobWF4LCBmYWN0b3IpIHtcblx0aWYgKE1hdGguYWJzKHRoaXMueCkgPiBtYXgpeyB0aGlzLnggKj0gZmFjdG9yOyB9XG5cdGlmIChNYXRoLmFicyh0aGlzLnkpID4gbWF4KXsgdGhpcy55ICo9IGZhY3RvcjsgfVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyBib3RoIHZlY3RvciBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZShuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NjcsIHk6NzNcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR0aGlzLnJhbmRvbWl6ZVgodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21pemVzIHRoZSB5IGF4aXMgd2l0aCBhIHZhbHVlIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplWChuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTUsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZVggPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dmFyIG1pbiA9IE1hdGgubWluKHRvcExlZnQueCwgYm90dG9tUmlnaHQueCk7XG5cdHZhciBtYXggPSBNYXRoLm1heCh0b3BMZWZ0LngsIGJvdHRvbVJpZ2h0LngpO1xuXHR0aGlzLnggPSByYW5kb20obWluLCBtYXgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyB0aGUgeSBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZVkobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo2NlxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplWSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR2YXIgbWluID0gTWF0aC5taW4odG9wTGVmdC55LCBib3R0b21SaWdodC55KTtcblx0dmFyIG1heCA9IE1hdGgubWF4KHRvcExlZnQueSwgYm90dG9tUmlnaHQueSk7XG5cdHRoaXMueSA9IHJhbmRvbShtaW4sIG1heCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21seSByYW5kb21pemVzIGVpdGhlciBheGlzIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplQW55KG5ldyBWaWN0b3IoNTAsIDYwKSwgbmV3IFZpY3Rvcig3MCwgODApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo3N1xuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplQW55ID0gZnVuY3Rpb24gKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XG5cdGlmICghISBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpKSB7XG5cdFx0dGhpcy5yYW5kb21pemVYKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3VuZHMgYm90aCBheGlzIHRvIGFuIGludGVnZXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLjIsIDUwLjkpO1xuICpcbiAqICAgICB2ZWMudW5mbG9hdCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjUxXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS51bmZsb2F0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XG5cdHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdW5kcyBib3RoIGF4aXMgdG8gYSBjZXJ0YWluIHByZWNpc2lvblxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAuMiwgNTAuOSk7XG4gKlxuICogICAgIHZlYy51bmZsb2F0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NTFcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gUHJlY2lzaW9uIChkZWZhdWx0OiA4KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b0ZpeGVkID0gZnVuY3Rpb24gKHByZWNpc2lvbikge1xuXHRpZiAodHlwZW9mIHByZWNpc2lvbiA9PT0gJ3VuZGVmaW5lZCcpIHsgcHJlY2lzaW9uID0gODsgfVxuXHR0aGlzLnggPSB0aGlzLngudG9GaXhlZChwcmVjaXNpb24pO1xuXHR0aGlzLnkgPSB0aGlzLnkudG9GaXhlZChwcmVjaXNpb24pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBYIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhYID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueCA9ICgxIC0gYW1vdW50KSAqIHRoaXMueCArIGFtb3VudCAqIHZlYy54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBZIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WSh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhZID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueSA9ICgxIC0gYW1vdW50KSAqIHRoaXMueSArIGFtb3VudCAqIHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXggPSBmdW5jdGlvbiAodmVjLCBhbW91bnQpIHtcblx0dGhpcy5taXhYKHZlYywgYW1vdW50KTtcblx0dGhpcy5taXhZKHZlYywgYW1vdW50KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqICMgUHJvZHVjdHNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IHZlYzEuY2xvbmUoKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IEEgY2xvbmUgb2YgdGhlIHZlY3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIG5ldyBWaWN0b3IodGhpcy54LCB0aGlzLnkpO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYW5vdGhlciB2ZWN0b3IncyBYIGNvbXBvbmVudCBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5WCh2ZWMxKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmNvcHlYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbm90aGVyIHZlY3RvcidzIFkgY29tcG9uZW50IGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHlZKHZlYzEpO1xuICpcbiAqICAgICB2ZWMyLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeToyMFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY29weVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueSA9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29waWVzIGFub3RoZXIgdmVjdG9yJ3MgWCBhbmQgWSBjb21wb25lbnRzIGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHkodmVjMSk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwLCB5OjIwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLmNvcHlYKHZlYyk7XG5cdHRoaXMuY29weVkodmVjKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZlY3RvciB0byB6ZXJvICgwLDApXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICpcdFx0IHZhcjEuemVybygpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjAsIHk6MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy54ID0gdGhpcy55ID0gMDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZG90KHZlYzIpO1xuICogICAgIC8vID0+IDIzMDAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEb3QgcHJvZHVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiAodmVjMikge1xuXHRyZXR1cm4gdGhpcy54ICogdmVjMi54ICsgdGhpcy55ICogdmVjMi55O1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uICh2ZWMyKSB7XG5cdHJldHVybiAodGhpcy54ICogdmVjMi55ICkgLSAodGhpcy55ICogdmVjMi54ICk7XG59O1xuXG4vKipcbiAqIFByb2plY3RzIGEgdmVjdG9yIG9udG8gYW5vdGhlciB2ZWN0b3IsIHNldHRpbmcgaXRzZWxmIHRvIHRoZSByZXN1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqXG4gKiAgICAgdmVjLnByb2plY3RPbnRvKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gcHJvamVjdCB0aGlzIHZlY3RvciBvbnRvXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnByb2plY3RPbnRvID0gZnVuY3Rpb24gKHZlYzIpIHtcbiAgICB2YXIgY29lZmYgPSAoICh0aGlzLnggKiB2ZWMyLngpKyh0aGlzLnkgKiB2ZWMyLnkpICkgLyAoKHZlYzIueCp2ZWMyLngpKyh2ZWMyLnkqdmVjMi55KSk7XG4gICAgdGhpcy54ID0gY29lZmYgKiB2ZWMyLng7XG4gICAgdGhpcy55ID0gY29lZmYgKiB2ZWMyLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZURlZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHJhZGlhbjJkZWdyZWVzKHRoaXMuaG9yaXpvbnRhbEFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS52ZXJ0aWNhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLngsIHRoaXMueSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnZlcnRpY2FsQW5nbGVEZWcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiByYWRpYW4yZGVncmVlcyh0aGlzLnZlcnRpY2FsQW5nbGUoKSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGU7XG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlRGVnID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGVEZWc7XG5WaWN0b3IucHJvdG90eXBlLmRpcmVjdGlvbiA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlO1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuXHR2YXIgbnggPSAodGhpcy54ICogTWF0aC5jb3MoYW5nbGUpKSAtICh0aGlzLnkgKiBNYXRoLnNpbihhbmdsZSkpO1xuXHR2YXIgbnkgPSAodGhpcy54ICogTWF0aC5zaW4oYW5nbGUpKSArICh0aGlzLnkgKiBNYXRoLmNvcyhhbmdsZSkpO1xuXG5cdHRoaXMueCA9IG54O1xuXHR0aGlzLnkgPSBueTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlRGVnID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cdGFuZ2xlID0gZGVncmVlczJyYWRpYW4oYW5nbGUpO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGUoYW5nbGUpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUbyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJldHVybiB0aGlzLnJvdGF0ZShyb3RhdGlvbi10aGlzLmFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUb0RlZyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVUbyhyb3RhdGlvbik7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5ID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHZhciBhbmdsZSA9IHRoaXMuYW5nbGUoKSArIHJvdGF0aW9uO1xuXG5cdHJldHVybiB0aGlzLnJvdGF0ZShhbmdsZSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5RGVnID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVCeShyb3RhdGlvbik7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIG9mIHRoZSBYIGF4aXMgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWCh2ZWMyKTtcbiAqICAgICAvLyA9PiAtMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiB0aGlzLnggLSB2ZWMueDtcbn07XG5cbi8qKlxuICogU2FtZSBhcyBgZGlzdGFuY2VYKClgIGJ1dCBhbHdheXMgcmV0dXJucyBhbiBhYnNvbHV0ZSBudW1iZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5hYnNEaXN0YW5jZVgodmVjMik7XG4gKiAgICAgLy8gPT4gMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWCh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2Ugb2YgdGhlIFkgYXhpcyBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IC0xMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VZID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gdGhpcy55IC0gdmVjLnk7XG59O1xuXG4vKipcbiAqIFNhbWUgYXMgYGRpc3RhbmNlWSgpYCBidXQgYWx3YXlzIHJldHVybnMgYW4gYWJzb2x1dGUgbnVtYmVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IDEwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWSh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5kaXN0YW5jZSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDAuNDk4NzU2MjExMjA4OVxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVNxKHZlYykpO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VTcSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VTcSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dmFyIGR4ID0gdGhpcy5kaXN0YW5jZVgodmVjKSxcblx0XHRkeSA9IHRoaXMuZGlzdGFuY2VZKHZlYyk7XG5cblx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb3IgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGgoKTtcbiAqICAgICAvLyA9PiAxMTEuODAzMzk4ODc0OTg5NDhcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IExlbmd0aCAvIE1hZ25pdHVkZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcbn07XG5cbi8qKlxuICogU3F1YXJlZCBsZW5ndGggLyBtYWduaXR1ZGVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGhTcSgpO1xuICogICAgIC8vID0+IDEyNTAwXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBMZW5ndGggLyBNYWduaXR1ZGVcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGVuZ3RoU3EgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IFZpY3Rvci5wcm90b3R5cGUubGVuZ3RoO1xuXG4vKipcbiAqIFJldHVybnMgYSB0cnVlIGlmIHZlY3RvciBpcyAoMCwgMClcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmVjLnplcm8oKTtcbiAqXG4gKiAgICAgLy8gPT4gdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHRydWUgaWYgdGhpcyB2ZWN0b3IgaXMgdGhlIHNhbWUgYXMgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZlYzEuaXNFcXVhbFRvKHZlYzIpO1xuICpcbiAqICAgICAvLyA9PiB0cnVlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaXNFcXVhbFRvID0gZnVuY3Rpb24odmVjMikge1xuXHRyZXR1cm4gdGhpcy54ID09PSB2ZWMyLnggJiYgdGhpcy55ID09PSB2ZWMyLnk7XG59O1xuXG4vKipcbiAqICMgVXRpbGl0eSBNZXRob2RzXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIGFuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MjBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gJ3g6JyArIHRoaXMueCArICcsIHk6JyArIHRoaXMueTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b0FycmF5KCk7XG4gKiAgICAgLy8gPT4gWzEwLCAyMF1cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9PYmplY3QoKTtcbiAqICAgICAvLyA9PiB7IHg6IDEwLCB5OiAyMCB9XG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b09iamVjdCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHsgeDogdGhpcy54LCB5OiB0aGlzLnkgfTtcbn07XG5cblxudmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5mdW5jdGlvbiByYW5kb20gKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG59XG5cbmZ1bmN0aW9uIHJhZGlhbjJkZWdyZWVzIChyYWQpIHtcblx0cmV0dXJuIHJhZCAqIGRlZ3JlZXM7XG59XG5cbmZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFuIChkZWcpIHtcblx0cmV0dXJuIGRlZyAvIGRlZ3JlZXM7XG59XG4iXX0=
