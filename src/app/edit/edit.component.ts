import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICourse } from '../../types';
import { API } from '../../data';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
    selector: 'app-edit',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatDatepickerModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule,
        CommonModule,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css'
})
export class EditComponent {
    @Input() course: ICourse | null = null;
    @Output() Cancel = new EventEmitter<void>();
    @Output() Saved = new EventEmitter<void>();
    title: string = 'New Course';
    editing: boolean = false;
    saving: boolean = false;
    courseDescription: string = '';
    startDate: string = '';
    endDate: string = '';
    error: {[key: string]: string} = {};
    errorLabels: string[] = [];
    currencyCodes: string[] = [];
    currency: string = 'USD';
    autocompleteOptions: {[key: string]: string[]} = {};
    autocompleteTimeout: {[key: string]: any} = {};

    cancelEvent(event: Event) {
        event.stopPropagation();
        this.Cancel.emit();
    }

    doNotCancel(event: Event) {
        event.stopPropagation();
    }

    setField(field: string, event: any) {
        if (field === 'StartDate') {
            const value = event.value;
            const date = new Date(value);
            const offset = new Date().getTimezoneOffset() * 60000;
            this.startDate = new Date(date.getTime() + offset).toISOString();
        } else if (field === 'EndDate') {
            const value = event.value;
            const date = new Date(value);
            const offset = new Date().getTimezoneOffset() * 60000;
            this.endDate = new Date(date.getTime() + offset).toISOString();
        } else if (field === 'CourseDescription') {
            this.courseDescription = (event.target as HTMLInputElement).value;
        } else if (!this.course) {
            return;
        } else if (field === 'CourseName') {
            this.course.CourseName = (event.target as HTMLInputElement).value;
            this.autocomplete('CourseName', this.course.CourseName);
        } else if (field === 'University') {
            this.course.University = (event.target as HTMLInputElement).value;
            this.autocomplete('University', this.course.University);
        } else if (field === 'City') {
            this.course.City = (event.target as HTMLInputElement).value;
            this.autocomplete('City', this.course.City);
        } else if (field === 'Country') {
            this.course.Country = (event.target as HTMLInputElement).value;
            this.autocomplete('Country', this.course.Country);
        } else if (field === 'Price') {
            const value = (event.target as HTMLInputElement).value;
            this.course.Price = parseFloat(value);
            if (!isNaN(parseFloat(value))) {
                (event.target as HTMLInputElement).value = this.course.Price.toString();
            }
        }
    }

    setCurrency(select: MatSelectChange) {
        this.currency = select.value;
    }

    verify() {
        if (!this.course) {
            this.error['course'] = 'No course to save';
            return false;
        } else {
            delete this.error['course'];
        }
        if (!this.course.CourseName || !this.course.University || !this.course.City || !this.course.Country || !this.course.Price || !this.startDate || !this.endDate || !this.courseDescription) {
            this.error['required'] = 'All fields are required';
        } else {
            delete this.error['required'];
        }
        /* Verify start and end date are in a proper date format */
        if (isNaN(Date.parse(this.startDate))) {
            this.error['startDate'] = 'Invalid start date';
        } else {
            delete this.error['startDate'];
        }
        if (isNaN(Date.parse(this.endDate))) {
            this.error['endDate'] = 'Invalid end date';
        } else {
            delete this.error['endDate'];
        }
        /* Verify currency is in the valid currency list */
        if (!this.currencyCodes.includes(this.currency)) {
            this.error['currency'] = 'Invalid currency code';
        } else {
            delete this.error['currency'];
        }
        /* Check if price is a valid floating number */
        if (isNaN(this.course.Price)) {
            this.error['price'] = 'Price must be a number';
        } else {
            delete this.error['price'];
        }
        this.errorLabels = Object.keys(this.error);
        return Object.keys(this.error).length === 0;
    }

    autocomplete(field: string, value: string) {
        if (this.autocompleteTimeout[field]) {
            clearTimeout(this.autocompleteTimeout[field]);
            delete this.autocompleteTimeout[field];
        }
        if (!value) {
            delete this.autocompleteOptions[field];
            return;
        }
        this.autocompleteTimeout[field] = setTimeout(() => {
            API.autocomplete(field, value).then((data) => {
                this.autocompleteOptions[field] = data;
            });
        }, 500);
    }

    fixData(course: ICourse) {
        delete course._id;
        course.StartDate = new Date(this.startDate).toISOString();
        course.EndDate = new Date(this.endDate).toISOString();
        course.StartDate = course.StartDate.split('T')[0];
        course.EndDate = course.EndDate.split('T')[0];   
        course.Currency = this.currency;     
    }

    save() {
        if (!this.course) {
            return;
        }
        if (!this.verify()) {
            return;
        }
        if (this.editing && this.course._id) {
            const courseId = this.course._id;
            const data: ICourse = {...this.course};
            this.saving = true;
            this.fixData(data);
            API.update(courseId, data).then(() => {
                this.saving = false;
                this.Saved.emit();
                this.Cancel.emit();
            });
        } else {
            this.fixData(this.course);
            this.saving = true;
            API.add(this.course).then(() => {
                this.saving = false;
                this.Saved.emit();
                this.Cancel.emit();
            });
        }
    }

    ngOnInit() {
        API.currencyCodes().then((data) => {
            this.currencyCodes = data;
        });
    }

    ngOnChanges() {
        if (this.course === null) {
            return;
        }
        if (this.course._id) {
            this.title = 'Edit Course';
            this.editing = true;
        }
        this.courseDescription = this.course?.CourseDescription || '';
        this.startDate = this.course?.StartDate || '';
        this.endDate = this.course?.EndDate || '';
        this.currency = this.course?.Currency || 'USD';
    }
}
