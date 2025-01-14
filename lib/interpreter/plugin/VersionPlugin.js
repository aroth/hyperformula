/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { HyperFormula } from '../../HyperFormula';
import { FunctionPlugin } from './FunctionPlugin';
const LICENSE_STATUS_MAP = new Map([
    ['gpl-v3', 1],
    ["missing" /* MISSING */, 2],
    ["invalid" /* INVALID */, 3],
    ["expired" /* EXPIRED */, 4],
]);
export class VersionPlugin extends FunctionPlugin {
    version(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('VERSION'), () => {
            const { licenseKeyValidityState: validityState, licenseKey, } = this.config;
            let status;
            if (LICENSE_STATUS_MAP.has(licenseKey)) {
                status = LICENSE_STATUS_MAP.get(licenseKey);
            }
            else if (LICENSE_STATUS_MAP.has(validityState)) {
                status = LICENSE_STATUS_MAP.get(validityState);
            }
            else if (validityState === "valid" /* VALID */) {
                status = licenseKey.slice(-5);
            }
            return `HyperFormula v${HyperFormula.version}, ${status}`;
        });
    }
}
VersionPlugin.implementedFunctions = {
    'VERSION': {
        method: 'version',
        parameters: [],
    },
};
