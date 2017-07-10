import CanvasWidget from './canvasWidget.js'

/**
 * A joystick that can be used to select an XY position and then snaps back. 
 * @module Joystick
 * @augments CanvasWidget
 */ 

let Joystick = Object.create( CanvasWidget ) 

Object.assign( Joystick, {
  /** @lends Joystick.prototype */

  /**
   * A set of default property settings for all Joystick instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Joystick
   * @static
   */  
  defaults: {
    __value:[.5,.5], // always 0-1, not for end-users
    value:[.5,.5],   // end-user value that may be filtered
    active: false,
  },

  /**
   * Create a new Joystick instance.
   * @memberof Joystick
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create( props ) {
    let joystick = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    CanvasWidget.create.call( joystick )

    // ...and then finally override with user defaults
    Object.assign( joystick, Joystick.defaults, props )

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) joystick.__value = props.value
    
    // inherits from Widget
    joystick.init()

    return joystick
  },

  /**
   * Draw the Joystick onto its canvas context using the current .__value property.
   * @memberof Joystick
   * @instance
   */
  perp_norm_vector(value) {
    let x1 = value[0]-.5
    let y1 = value[1]-.5
    let x2 = 0.0
    let y2 = -(x1/y1)*(x2-x1)+y1
    let x3 = x2-x1
    let y3 = y2-y1
    let m = Math.sqrt(x3*x3+y3*y3)
    x3 = x3/m
    y3 = y3/m

    return [x3,y3]
  },

  draw() {
    // draw background
    this.ctx.fillStyle   = this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth
    this.ctx.fillRect( 0,0, this.rect.width, this.rect.height )

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill
    let v = this.perp_norm_vector(this.__value)
    let r = 15.0

    this.ctx.beginPath();
    this.ctx.moveTo(this.rect.width*0.5 + r*v[0]*.25,this.rect.height*.5 + r*v[1]*.25);
    this.ctx.lineTo(this.rect.width *this.__value[0]+r*v[0], this.rect.height * this.__value[1]+r*v[1]);
    this.ctx.lineTo(this.rect.width *this.__value[0]-r*v[0], this.rect.height * this.__value[1]-r*v[1]);
    this.ctx.lineTo(this.rect.width*0.5 - r*v[0]*.25,this.rect.height*.5 - r*v[1]*.25);
    this.ctx.fill();
  //  this.ctx.fillRect( this.rect.width * this.__value[0] -12, this.rect.height * this.__value[1] -12, 24, 24 )
    this.ctx.beginPath();
    this.ctx.arc(this.rect.width *this.__value[0],this.rect.height * this.__value[1],r,0,2*Math.PI);
    this.ctx.fill();


    this.ctx.beginPath();
    this.ctx.arc(this.rect.width *0.5,this.rect.height * 0.5,r*.25,0,2*Math.PI);
    this.ctx.fill();


    this.ctx.strokeRect( 0,0, this.rect.width, this.rect.height )
  },

  addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  events: {
    pointerdown( e ) {
      this.active = true
      this.pointerId = e.pointerId

      this.processPointerPosition( e ) // change slider value on click / touchdown

      window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      window.addEventListener( 'pointerup',   this.pointerup ) 
    },

    pointerup( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.active = false
        window.removeEventListener( 'pointermove', this.pointermove ) 
        window.removeEventListener( 'pointerup',   this.pointerup ) 
        this.__value = [.5,.5]
        this.output()
        this.draw()
      }
    },

    pointermove( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.processPointerPosition( e )
      }
    },
  },
  
  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Joystick's position, and triggers output.
   * @instance
   * @memberof Joystick
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition( e ) {

    this.__value[0] = ( e.clientX - this.rect.left ) / this.rect.width
    this.__value[1] = ( e.clientY - this.rect.top  ) / this.rect.height 
    

    // clamp __value, which is only used internally
    if( this.__value[0] > 1 ) this.__value[0] = 1
    if( this.__value[1] > 1 ) this.__value[1] = 1
    if( this.__value[0] < 0 ) this.__value[0] = 0
    if( this.__value[1] < 0 ) this.__value[1] = 0

    let shouldDraw = this.output()
    
    if( shouldDraw ) this.draw()
  },

})

export default Joystick
