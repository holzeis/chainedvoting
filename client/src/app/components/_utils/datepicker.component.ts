
import {Component, EventEmitter} from '@angular/core';

import {MaterializeAction} from "angular2-materialize";

declare var Materialize: any;

@Component({
    selector: "date-picker",
    templateUrl: "datepicker.component.html"
})
export class DatePickerComponent {
    validFrom: string;
    validTo: string;

    validFromActions = new EventEmitter<string|MaterializeAction>();
    validToActions = new EventEmitter<string|MaterializeAction>();
}