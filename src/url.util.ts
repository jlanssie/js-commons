/**
 * Utility class for working with URL-related operations.
 */
"use strict";

class UrlUtil {
  /**
   * Retrieves the protocol of the current URL, e.g.: 'http:', 'https:'
   */
  static getProtocol(): string {
    return window.location.protocol;
  }

  /**
   * Retrieves the hostname (domain) of the current URL, e.g.: 'www.google.com'
   */
  static getHostName(): string {
    return window.location.hostname;
  }

  /**
   * Retrieves the URL parameters as a URLSearchParams object from the current URL, e.g.: 'https://www.google.com/?q=searchString' => '?q=searchString'
   */
  static getUrlParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Retrieves the anchor (fragment identifier) from the current URL, e.g.: 'https://www.google.com/#anchor' => 'anchor'
   * Note: Excludes the '#' character from the result.
   */
  static getAnchor(): string {
    return window.location.hash.substring(1);
  }
}

export default UrlUtil;
