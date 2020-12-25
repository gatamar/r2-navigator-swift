var gSelectedCustomBlockNum = -1; // it's not selection, it's existing block
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
    gSelectedCustomBlockNum = -1;
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

// resultPath: inout array [el, el.parent, ..., ancestorEl]
function findPathToAncestor(el, ancestorEl, resultPath)
{
    if ( el == ancestorEl ) return;
    resultPath.push(el);
    findPathToAncestor(el.parentNode, ancestorEl, resultPath);
}

// yes, we wrap a full text block
function wrapSimpleTextBlockIntoCustomSpan(textBlock, blockId)
{
    var block = document.createElement(gCustomHtmlType);
    
    if ( textBlock.nodeType == 3 )
    {
        textBlock.parentNode.insertBefore(block, textBlock);
        block.appendChild(textBlock);
        textBlock = textBlock.parentNode;
        makeTheBlockReallyCustom(textBlock, blockId);
        return;
    }
    
    if (  textBlock.nodeName == "ins" )
    {
        if ( textBlock.children != "undefined" && textBlock.children.length == 1 )
        {
            textBlock = textBlock.children[0];
        }
    }
        
    if ( gQuiteComplexTags.includes(textBlock.nodeName) )
    {
        var tagBefore = "<"+gCustomHtmlType+">";
        var tagAfter = "</"+gCustomHtmlType+">";
        textBlock.innerHTML = tagBefore + textBlock.innerHTML + tagAfter;
        makeTheBlockReallyCustom(textBlock.children[0], blockId);
    }
    else
    {
        textBlock.parentNode.insertBefore(block, textBlock);
        block.appendChild(textBlock);
        textBlock = textBlock.parentNode;
        makeTheBlockReallyCustom(textBlock, blockId);
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

function modifyTreePartForBorderElement(elem, elemBlockAncestor, blockId, dirNext)
{
    while(elem != elemBlockAncestor)
    {
        if ( elem && elem.nodeType == 3)
        {
            var elemPtr = elem;
            wrapSimpleTextBlockIntoCustomSpan(elemPtr, blockId);
        }
        if ( dirNext )
        {
            if ( elem && elem.nextSibling == null ) { elem = elem.parentNode; continue; }
            elem = elem.nextSibling;
        }
        else
        {
            if ( elem && elem.previousSibling == null ) { elem = elem.parentNode; continue; }
            elem = elem.previousSibling;
        }
    }
}

// returns: dispatches "CMD_CUSTOM_BLOCK_JUST_ADDED_"
// but should I dispatch it instead of just return in this case?
function processContextMenuCommand(colorType, isMindMap, gCustomBlockNum)
{
    if ( gSelectedCustomBlockNum != -1 )
    {
        changeExistingCustomBlockProperties(gSelectedCustomBlockNum, colorType, isMindMap, false);
        sendCMD(`CMD_CUSTOM_BLOCK_JUST_UPDATED_${gSelectedCustomBlockNum}_${colorType}_${isMindMap}`);
        resetActiveBlock();
    }
    else
    {
        var selText = window.getSelection().toString();
        if ( selText.length !== 0 )
        {
            var range = window.getSelection().getRangeAt(0);
            if ( range.startContainer != range.endContainer )
            {
                var ancestor = range.commonAncestorContainer;
                var startPath = [], endPath = [];
                findPathToAncestor(range.startContainer, ancestor, startPath);
                findPathToAncestor(range.endContainer, ancestor, endPath);
                
                var startBlockAncestor = startPath[startPath.length-1];
                var endBlockAncestor = endPath[endPath.length-1];
                
                var startedDoingMiddleBlocks = false;
                for ( var ii=0; ii<startBlockAncestor.parentNode.children.length; ii++)
                {
                    var block_block = startBlockAncestor.parentNode.children[ii];
                    
                    if ( !startedDoingMiddleBlocks && block_block == startBlockAncestor )
                    {
                        startedDoingMiddleBlocks = true;
                        continue;
                    }
                    if ( startedDoingMiddleBlocks && block_block == endBlockAncestor)
                    {
                        break;
                    }
                    
                    if ( startedDoingMiddleBlocks )
                    {
                        wrapSimpleTextBlockIntoCustomSpan(block_block, gCustomBlockNum);
                    }
                }
                
                var start = range.startContainer.splitText(range.startOffset);
                modifyTreePartForBorderElement(start, startBlockAncestor, gCustomBlockNum, true); // range.startContainer
                var end = range.endContainer.splitText(range.endOffset);
                end = end.previousSibling;
                modifyTreePartForBorderElement(end, endBlockAncestor, gCustomBlockNum, false);
            }
            else
            {
                var curCustomBlock = document.createElement(gCustomHtmlType);
                range.surroundContents(curCustomBlock);
                makeTheBlockReallyCustom(curCustomBlock, gCustomBlockNum);
            }
            changeExistingCustomBlockProperties(gCustomBlockNum, colorType, isMindMap, true);
            
            clearTextSelection();
            resetActiveBlock();
            
            sendCMD(`CMD_CUSTOM_BLOCK_JUST_ADDED_${gCustomBlockNum}_${colorType}_${isMindMap}_${getFullTextOfHTMLBlocksWithID(gCustomBlockNum)}`);
        }
    }
}
