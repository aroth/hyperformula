/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export function collatorFromConfig(config) {
    const sensitivity = config.caseSensitive ? (config.accentSensitive ? 'variant' : 'case') : (config.accentSensitive ? 'accent' : 'base');
    const caseFirst = config.caseFirst;
    const ignorePunctuation = config.ignorePunctuation;
    return new Intl.Collator(config.localeLang, { sensitivity, caseFirst, ignorePunctuation });
}
