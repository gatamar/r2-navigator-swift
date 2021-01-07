//
//  Navigator.swift
//  r2-navigator-swift
//
//  Created by Mickaël Menu on 25.03.19.
//
//  Copyright 2019 Readium Foundation. All rights reserved.
//  Use of this source code is governed by a BSD-style license which is detailed
//  in the LICENSE file present in the project repository where this source code is maintained.
//

import Foundation
import SafariServices
import R2Shared

public struct CustomBlockProps {
    public var blockId: Int = -1
    public var color: Int = 0
    public var isMindMap: Bool = false
    
    public init(blockId: Int, color: Int, isMindMap: Bool) {
        self.blockId = blockId
        self.color = color
        self.isMindMap = isMindMap
    }
}

public protocol Navigator {
    
    /// Current position in the publication.
    /// Can be used to save a bookmark to the current position.
    var currentLocation: Locator? { get }

    /// Moves to the position in the publication correponding to the given `Locator`.
    /// - Parameter completion: Called when the transition is completed.
    /// - Returns: Whether the navigator is able to move to the locator. The completion block is only called if true was returned.
    @discardableResult
    func go(to locator: Locator, animated: Bool, completion: @escaping () -> Void) -> Bool

    /// Moves to the position in the publication targeted by the given link.
    /// - Parameter completion: Called when the transition is completed.
    /// - Returns: Whether the navigator is able to move to the locator. The completion block is only called if true was returned.
    @discardableResult
    func go(to link: Link, animated: Bool, completion: @escaping () -> Void) -> Bool
    
    /// Moves to the position in the publication targeted by the given custom block ID.
    /// - Parameter completion: Called when the transition is completed.
    /// - Returns: Whether the navigator is able to move to the locator. The completion block is only called if true was returned.
    @discardableResult
    func go(to customBlock: Int, animated: Bool, completion: @escaping () -> Void) -> Bool
    
    /// Moves to the next content portion (eg. page) in the reading progression direction.
    /// - Parameter completion: Called when the transition is completed.
    /// - Returns: Whether the navigator is able to move to the next content portion. The completion block is only called if true was returned.
    @discardableResult
    func goForward(animated: Bool, completion: @escaping () -> Void) -> Bool
    
    /// Moves to the previous content portion (eg. page) in the reading progression direction.
    /// - Parameter completion: Called when the transition is completed.
    /// - Returns: Whether the navigator is able to move to the previous content portion. The completion block is only called if true was returned.
    @discardableResult
    func goBackward(animated: Bool, completion: @escaping () -> Void) -> Bool

    @discardableResult
    func createCustomBlock(with props: CustomBlockProps, completion: @escaping () -> Void) -> Bool
    
    @discardableResult
    func editCustomBlock(with props: CustomBlockProps, completion: @escaping () -> Void) -> Bool
    
    @discardableResult
    func reapplySelection(for spread: Link, selection blocks: [CustomBlockDTO], completion: @escaping () -> Void) -> Bool
}

public extension Navigator {
    
    /// Adds default values for the parameters.
    @discardableResult
    func go(to locator: Locator, animated: Bool = false, completion: @escaping () -> Void = {}) -> Bool {
        return go(to: locator, animated: animated, completion: completion)
    }
    
    /// Adds default values for the parameters.
    @discardableResult
    func go(to link: Link, animated: Bool = false, completion: @escaping () -> Void = {}) -> Bool {
        return go(to: link, animated: animated, completion: completion)
    }
    
    /// Adds default values for the parameters.
    @discardableResult
    func goForward(animated: Bool = false, completion: @escaping () -> Void = {}) -> Bool {
        return goForward(animated: animated, completion: completion)
    }
    
    /// Adds default values for the parameters.
    @discardableResult
    func goBackward(animated: Bool = false, completion: @escaping () -> Void = {}) -> Bool {
        return goBackward(animated: animated, completion: completion)
    }

}

public struct CustomBlockDTO {
    public var noteID: Int64
    //public var bookID: Int64
    public var colorType: Int
    public var pageHRef: String
    public var serializedSel: String
    
    // , bookID: Int64
    public init(noteID: Int64, colorType: Int, pageHRef: String, serializedSel: String) {
        self.noteID = noteID
        //self.bookID = bookID
        self.colorType = colorType
        self.pageHRef = pageHRef
        self.serializedSel = serializedSel
    }
}
    
public protocol NavigatorDelegate: AnyObject {

    /// Called when the current position in the publication changed. You should save the locator here to restore the last read page.
    func navigator(_ navigator: Navigator, locationDidChange locator: Locator)
    
    /// Called when an error must be reported to the user.
    func navigator(_ navigator: Navigator, presentError error: NavigatorError)
    
    /// Called when the user tapped an external URL. The default implementation opens the URL with the default browser.
    func navigator(_ navigator: Navigator, presentExternalURL url: URL)
    
    /// Called when the user taps on a link referring to a note.
    ///
    /// Return `true` to navigate to the note, or `false` if you intend to present the
    /// note yourself, using its `content`. `link.type` contains information about the
    /// format of `content` and `referrer`, such as `text/html`.
    func navigator(_ navigator: Navigator, shouldNavigateToNoteAt link: Link, content: String, referrer: String?) -> Bool
    
    func navigator(_ navigator: Navigator, selectionChanged atRect: CGRect)
    
    func navigator(_ navigator: Navigator, didScrollingBegin: Bool)
    
    func navigator(_ navigator: Navigator, didDragAndDropBegin: Bool)
    
    func navigator(_ navigator: Navigator, didAddCustomBlock block: CustomBlockDTO)
    
    func navigator(_ navigator: Navigator, didLoadSpread spread: Link)
}


public extension NavigatorDelegate {
    
    func navigator(_ navigator: Navigator, presentExternalURL url: URL) {
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.openURL(url)
        }
    }
    
    func navigator(_ navigator: Navigator, shouldNavigateToNoteAt link: Link, content: String, referrer: String?) -> Bool {
        return true
    }

}


public enum NavigatorError: LocalizedError {
    /// The user tried to copy the text selection but the DRM License doesn't allow it.
    case copyForbidden
    
    public var errorDescription: String? {
        switch self {
        case .copyForbidden:
            return R2NavigatorLocalizedString("NavigatorError.copyForbidden")
        }
    }
}
