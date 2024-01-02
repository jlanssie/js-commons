'use strict';

/**
 * Utility class for handling object-related operations.
 */

class ObjectUtils {
    /**
     * Check if an object is null or undefined
     * @param {object} object An object to check.
     * @return {boolean} Returns true if the parameter object is empty or null.
     */
    static isEmptyObject(object: any): boolean {
        if (object === null || object === undefined) { return true; }
        //@ts-ignore
        return Object.keys(object).length === 0;
    }

    /**
     * Check if one of the object's properties is null, undefined or empty
     * @param {object} object An object to check.
     * @return {boolean} Returns true if one of the parameter object's properties is null, undefined or empty
     */
    static isOnePropertyEmpty(object: any): boolean {
        for (const property in object) {
            if (object[property] === null || object[property] === undefined || object[property] === '') {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if all the object's properties are null, undefined or empty
     * @param {object} object An object to check.
     * @return {boolean} Returns true if all the parameter object's properties are null, undefined or empty
     */
    static areAllPropertiesEmpty(object: any): boolean {
        for (const property in object) {
            if (object[property] !== null || object[property] !== undefined) {
                return false;
            }
        }
        return true;
    }

    static emptyObject: object = {};
}

export default ObjectUtils;
