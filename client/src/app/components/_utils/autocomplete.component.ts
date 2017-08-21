import { Component, ElementRef, HostListener } from '@angular/core';

import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
    moduleId: module.id,
    selector: 'app-autocomplete',
    templateUrl: 'autocomplete.component.html',
    styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent {
    public query = '';
    public users = [];
    public filteredList = [];
    public elementRef;

    constructor(myElement: ElementRef, private userService: UserService, private alertService: AlertService) {
        this.elementRef = myElement;
        userService.getAllUsers().then(res => {
            console.log(res);
            this.users = res.map(user => user.email);
        }).catch(error => this.alertService.error(error));
    }

    public filter() {
        if (this.query !== '') {
            this.filteredList = this.users.filter(function(el) {
                return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            }.bind(this));
        } else {
            this.filteredList = [];
        }
    }

    public select(item) {
        this.query = item;
        this.filteredList = [];
    }

    @HostListener('click', ['$event'])
    public handleClick(event) {
        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        if (!inside) {
            this.filteredList = [];
        }
    }
}
