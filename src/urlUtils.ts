/**
 * Utility class for working with URL-related operations.
 */
'use strict';

class UrlUtils {
    /**
     * Retrieves the protocol (e.g., 'http:', 'https:', etc.) of the current URL.
     * @returns {string} The protocol of the current URL.
     */
    static getProtocol(): string {
        return window.location.protocol;
    }

    /**
     * Retrieves the hostname (domain) of the current URL.
     * @returns {string} The hostname of the current URL.
     */
    static getHostName(): string {
        return window.location.hostname;
    }

    /**
     * Retrieves the URL parameters as a URLSearchParams object from the current URL.
     * @returns {URLSearchParams} The URLSearchParams object containing the URL parameters.
     */
    static getUrlParams(): URLSearchParams {
        return new URLSearchParams(window.location.search);
    }

    /**
     * Retrieves the anchor (fragment identifier) from the current URL.
     * Note: Excludes the '#' character from the result.
     * @returns {string} The anchor (fragment identifier) of the current URL.
     */
    static getAnchor(): string {
        return window.location.hash.substring(1);
    }
}

export default UrlUtils;
