function restorePreviousHighlight(sel_str, colorType, border, blockId)
{
    var highlighter;
    rangy.init();
    
    highlighter = rangy.createHighlighter();
    highlighter.addClassApplier(rangy.createClassApplier("highlight", 42, "green", {
        ignoreWhiteSpace: true,
        tagNames: ["span", "a"],
        selection: rangy.restoreSelectionFromString(sel_str)
    }));
    highlighter.highlightSelection("highlight", null, getColorStringForColorType(colorType), border, blockId);
}

function highlightSelectionSomehow(color, border, blockId)
{
    var highlighter;
    rangy.init();
    
    var selObj = rangy.getSelection();
    var selString = rangy.serializeSelection(selObj, true);
    
    highlighter = rangy.createHighlighter();
    highlighter.addClassApplier(rangy.createClassApplier("highlight", blockId, color, {
        ignoreWhiteSpace: true,
        tagNames: ["span", "a"]
    }));
    highlighter.highlightSelection("highlight", null, color, border, blockId);
    
    window.getSelection().removeAllRanges();
    
    return selString;
}


var gCustomHtmlType = "ins";
var gQuiteComplexTags = ["p", "P", "h1", "h2", "h3", "h4", "h5", "H1", "H2", "H3", "H4"];

function sendCMD(cmd)
{
    //gSentCmdCounter += 1;
    //window.alert(cmd);
}

function getFullTextOfHTMLBlocksWithID(htmlID) {
    var curClassName = "MyCustomBlock"+htmlID.toString();
    var curTouchedBlockS = document.getElementsByClassName(curClassName);
    var text = "";
    for (var i=0; i<curTouchedBlockS.length; i++)
    {
        text += curTouchedBlockS[i].textContent + "\n";
    }
    return text;
}
    
function deleteHTMLBlockWithID(htmlID) {
    var curClassName = "MyCustomBlock"+htmlID.toString();
    var curTouchedBlockS = document.getElementsByClassName(curClassName);
    for (var i=0; i<curTouchedBlockS.length; i++)
    {
        var curTouchedBlock = curTouchedBlockS[i];
        curTouchedBlock.classList.remove(curClassName);
        curTouchedBlock.removeAttribute("style");
        curTouchedBlock.style.textDecoration = "none";
    }
    resetActiveBlock();
}

function detectTouchedCustomBlock(pagex, pagey) {
    var element = document.elementFromPoint(pagex, pagey);
    if ( element !== null && element.className.startsWith("MyCustomBlock") )
    {
        //var elColor = customBlock.getAttribute("ca_colorType");
        //if ( elColor == "0" ) { return null; }
        return element;
    }
        
    return null;
}

function resetActiveBlock()
{
    document.body.style.webkitUserSelect = "text";
    //sendDebugInfo(`TEST_SELECT: text`);
    sendCMD(`CMD_CUSTOM_BLOCK_HIDE_MENU`);
}

// https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
function clearTextSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
}

function getRGBACssStringForColorType(colorType)
{
    var red = 128, green = 128, blue = 128;
    if ( colorType == 1 ) // yellow
    {
        red = 255;
        green = 255;
        blue = 0;
    }
    if ( colorType == 2 ) // orange
    {
        red = 255;
        green = 128;
        blue = 0;
    }
    if ( colorType == 3 ) // blue
    {
        red = 0;
        green = 0;
        blue = 255;
    }
    if ( colorType == 4 ) // green
    {
        red = 0;
        green = 255;
        blue = 0;
    }
    return "rgba("+red.toString()+","+green.toString()+","+blue.toString()+",0.5)";
}

function getColorStringForColorType(colorType)
{
    if ( colorType == 1 ) // yellow
    {
        return "yellow";
    }
    if ( colorType == 2 ) // orange
    {
        return "orange";
    }
    if ( colorType == 3 ) // blue
    {
        return "blue";
    }
    if ( colorType == 4 ) // green
    {
        return "green";
    }
    return "";
}

// param "colorType": 0=not color,1,2,3,4 = some pre-defined color types
// param "isMindMap": -1,0,1
function changeExistingCustomBlockProperties(blockId, colorType, isMindMap, isNewBlock)
{
    var curClassName = "MyCustomBlock"+blockId.toString();
    var curCustomBlockS = document.getElementsByClassName(curClassName);
    
    for (var i=0; i<curCustomBlockS.length; i++)
    {
        var curCustomBlock = curCustomBlockS[i];
        // "backgroundColor": set, unset, reset, or remove unchanged
        if ( colorType == 0 )
        {
            //curCustomBlock.style.removeProperty('backgroundColor');
            curCustomBlock.style.backgroundColor = "";
        }
        else
        {
            if ( colorType !== -1 )
            {
                curCustomBlock.style.backgroundColor = getRGBACssStringForColorType(colorType);
            }
        }

        if ( isMindMap == 0 )
        {
            curCustomBlock.style.removeProperty('borderBottom');
        }
        if ( isMindMap == 1 )
        {
            curCustomBlock.style.borderBottom = "2px solid #0000FF";
        }
        
        if ( colorType != -1 )
            curCustomBlock.setAttribute("ca_colorType", colorType.toString());
        
        if ( isMindMap != -1 )
            curCustomBlock.setAttribute("ca_isMindMap", isMindMap.toString());
    }
}

function makeTheBlockReallyCustom(newBlock, blockId)
{
    newBlock.className = "MyCustomBlock" + blockId.toString();
    newBlock.style.textDecoration = "none";
    
    newBlock.setAttribute("ca_colorType", "0");
    newBlock.setAttribute("ca_isMindMap", "0");
    
    //style.display = "inline-block";
}


function isThereSuchBlockOnThisPage(blockId)
{
    var curClassName = "MyCustomBlock"+blockId.toString();
    var curCustomBlockS = document.getElementsByClassName(curClassName);
    return curCustomBlockS.length != 0;
}

// isMindMap: means "drawBorder", no intentional Storage specified :)
function processContextMenuCommand(colorType, isMindMap, gCustomBlockNum)
{
    // if there's no such block at this page, let's create it!!!
    // if there's such block at this page, let's modify it!!!
    
    if ( isThereSuchBlockOnThisPage(gCustomBlockNum) )
    {
        changeExistingCustomBlockProperties(gCustomBlockNum, colorType, isMindMap, false);
        resetActiveBlock();
    }
    else
    {
        var selString = highlightSelectionSomehow(getColorStringForColorType(colorType), isMindMap, gCustomBlockNum);
        resetActiveBlock();
        
        var info = {}
        info["serialSel"] = selString;
        info["blockID"] = gCustomBlockNum;
        info["colorType"] = colorType;
        webkit.messageHandlers.addedCustomBlockFromSelection.postMessage(info);
    }
}
