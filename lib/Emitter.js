/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { TinyEmitter } from 'tiny-emitter';
export var Events;
(function (Events) {
    Events["SheetAdded"] = "sheetAdded";
    Events["SheetRemoved"] = "sheetRemoved";
    Events["SheetRenamed"] = "sheetRenamed";
    Events["NamedExpressionAdded"] = "namedExpressionAdded";
    Events["NamedExpressionRemoved"] = "namedExpressionRemoved";
    Events["ValuesUpdated"] = "valuesUpdated";
    Events["EvaluationSuspended"] = "evaluationSuspended";
    Events["EvaluationResumed"] = "evaluationResumed";
})(Events || (Events = {}));
export class Emitter extends TinyEmitter {
    emit(event, ...args) {
        super.emit(event, ...args);
        return this;
    }
}
