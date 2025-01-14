/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { addressKey } from './Cell';
import { SimpleRangeValue } from './interpreter/SimpleRangeValue';
export class ContentChanges {
    constructor() {
        this.changes = new Map();
    }
    static empty() {
        return new ContentChanges();
    }
    addAll(other) {
        for (const change of other.changes.values()) {
            this.add(change.address, change);
        }
        return this;
    }
    addChange(newValue, address, oldValue) {
        this.addInterpreterValue(newValue, address, oldValue);
    }
    exportChanges(exporter) {
        let ret = [];
        this.changes.forEach((e) => {
            const change = exporter.exportChange(e);
            if (Array.isArray(change)) {
                ret = ret.concat(change);
            }
            else {
                ret.push(change);
            }
        });
        return ret;
    }
    getChanges() {
        return Array.from(this.changes.values());
    }
    isEmpty() {
        return this.changes.size === 0;
    }
    add(address, change) {
        const value = change.value;
        if (value instanceof SimpleRangeValue) {
            for (const cellAddress of value.effectiveAddressesFromData(address)) {
                this.changes.delete(`${cellAddress.sheet},${cellAddress.col},${cellAddress.row}`);
            }
        }
        this.changes.set(addressKey((address)), change);
    }
    addInterpreterValue(value, address, oldValue) {
        this.add(address, {
            address,
            value,
            oldValue
        });
    }
}
