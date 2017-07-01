var config = {
    desktopTiming: 1650,
    mobileTiming: 2500,
    scrollCheckThreshold: 3,
    onDown: doDownThings,
    onUp: doUpThings
}

function doDownThings () {
  var elem = "<p>I scrolled down</p>"
  document.querySelector('body').insertAdjacentHTML('beforebegin', elem)
}

function doUpThings () {
  var elem = "<p>I scrolled up</p>"
  document.querySelector('body').insertAdjacentHTML('beforebegin', elem)
}

/*
*    Instantiate State Object
*/
Object.assign(window, {
    goScrollYourself: {
        scrolling: false,
        scrollYCache: 0,
        checkCount: 0,
        hydrate: function () {
           this.scrolling = false,
           this.scrollYCache = window.scrollY
           this.checkCount = 0
        }
    }
})

/*
*    Add scroll listener for desktop
*/
addWheelListener( window, function(e) {
    catchStream(e, config.desktopTiming);
    e.preventDefault()
})

/*
*    Add scroll listener for mobile
*/
window.addEventListener('scroll', function (e) {
    catchStream(e, config.mobileTiming)
    e.preventDefault()
})

function catchStream (e, timing) {
    if (goScrollYourself.scrolling) return
    goScrollYourself.scrolling = true
    determineDirection.apply(this, arguments)
}

function determineDirection (e, timing) {
    if (e.deltaY > 0 || window.scrollY > goScrollYourself.scrollYCache) {
        scrolledDown(timing)
    } else {
      scrolledUp(timing)
    }
}

function scrolledDown (timing) {
    config.onDown()
    setTimeout(function () {
        checkDoneScrolling()
    }, timing)
}

function scrolledUp (timing) {
    config.onUp()
    setTimeout(function () {
        checkDoneScrolling()
    }, timing)
}

function checkDoneScrolling () {
    if (!window.scrollY === goScrollYourself.scrollYCache) {
        checkDoneScrolling()
    } else {
      if (goScrollYourself.checkCount < config.scrollCheckThreshold) {
          goScrollYourself.checkCount++
          checkDoneScrolling()
        } else {
            goScrollYourself.hydrate()
        }
    }
}

/*
*    https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
*/
(function(window,document) {

    var prefix = "", _addEventListener, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaY: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };

            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.deltaY || originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }

})(window,document);
