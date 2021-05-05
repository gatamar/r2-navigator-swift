(function() {
  window.addEventListener('DOMContentLoaded', function(event) {
      // If we don't set the CSS cursor property to pointer, then the click events are not triggered pre-iOS 13.
      document.body.style.cursor = 'pointer';
    
      document.addEventListener('click', onClick, false);
      document.addEventListener('touchstart', onTouchStart, false);
      document.addEventListener('touchend', onTouchEnd, false);
      document.addEventListener("dragstart", onDragStart, false);

  });

    function onDragStart(event) {
        const rect = event.target.getBoundingClientRect();
        offsetX = event.clientX - rect.x;
        offsetY = event.clientY - rect.y;
        var info = {};
        info['elemOffsetX'] = offsetX;
        info['elemOffsetY'] = offsetY;
        info['elemWidth'] = rect.width;
        info['elemHeight'] = rect.height;
        //if (e.dataTransfer !== null)
        //    if ( e.target.tagName == "img")
        //        var src = e.target.getAttribute("src");
        //        //TODO: store this "src", and when asked, give it; also store the tag - wrap in in custom block or so.
        webkit.messageHandlers.dragAndDropStarted.postMessage(info);
    }
    
    function onTouchStart(event) {
        // if inside block, make doc not-selectable
        var target = event.target;
        if ( target !== null && target.className.startsWith("MyCustomBlock") )
        {
            document.body.style.webkitUserSelect = "none";
        }
    }
    
    function onTouchEnd(event) {
        document.body.style.webkitUserSelect = "text";
        
        var info = {}
        var selectionText = window.getSelection().toString();
        if (event.touches.length == 0 && selectionText.length !== 0) {
            var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
            info['text'] = selectionText.trim();
            info['frame'] = {
                'x': rect.left,
                'y': rect.top,
                'width': rect.width,
                'height': rect.height
            };
            
            webkit.messageHandlers.selectionChangeEnd.postMessage(info);
        }
    }
    
  function onClick(event) {

    if (!window.getSelection().isCollapsed) {
      // There's an on-going selection, the tap will dismiss it so we don't forward it.
      return;
    }

    var target = event.target;
    var blockId = -1;
    if ( target !== null && target.className.startsWith("MyCustomBlock") && target.hasAttribute('blockId') )
    {
        blockId = parseInt(target.getAttribute("blockId"));
    }
    
    // Send the tap data over the JS bridge even if it's been handled
    // within the webview, so that it can be preserved and used
    // by the WKNavigationDelegate if needed.
    webkit.messageHandlers.tap.postMessage({
        "defaultPrevented": event.defaultPrevented,
        "screenX": event.screenX,
        "screenY": event.screenY,
        "clientX": event.clientX,
        "clientY": event.clientY,
        "targetElement": event.target.outerHTML,
        "interactiveElement": nearestInteractiveElement(event.target),
        "customBlockId": blockId,
        "debugInfo": target.className.toString() + "_" + target.hasAttribute('blockId').toString()
    });

    // We don't want to disable the default WebView behavior as it breaks some features without bringing any value.
//    event.stopPropagation();
//    event.preventDefault();
  }

  // See. https://github.com/JayPanoz/architecture/tree/touch-handling/misc/touch-handling
  function nearestInteractiveElement(element) {
    var interactiveTags = [
      'a',
      'audio',
      'button',
      'canvas',
      'details',
      'input',
      'label',
      'option',
      'select',
      'submit',
      'textarea',
      'video',
    ]
    if (interactiveTags.indexOf(element.nodeName.toLowerCase()) != -1) {
      return element.outerHTML;
    }

    // Checks whether the element is editable by the user.
    if (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable').toLowerCase() != 'false') {
      return element.outerHTML;
    }

    // Checks parents recursively because the touch might be for example on an <em> inside a <a>.
    if (element.parentElement) {
      return nearestInteractiveElement(element.parentElement);
    }
    
    return null;
  }

})();
