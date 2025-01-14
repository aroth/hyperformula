/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
/**
 * The list of all available states which the license checker can return.
 */
export declare const enum LicenseKeyValidityState {
    VALID = "valid",
    INVALID = "invalid",
    EXPIRED = "expired",
    MISSING = "missing"
}
/**
 * Checks if the provided license key is grammatically valid or not expired.
 *
 * @param {string} licenseKey The license key to check.
 * @returns {LicenseKeyValidityState} Returns the checking state.
 */
export declare function checkLicenseKeyValidity(licenseKey: string): LicenseKeyValidityState;
