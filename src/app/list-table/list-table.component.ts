import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { API } from '../../data';
import { Courses, ICourse } from '../../types';
import { CommonModule, formatCurrency, getCurrencySymbol } from '@angular/common';

@Component({
    selector: 'app-list-table',
    standalone: true,
    imports: [
        MatTableModule,
        MatIconModule,
        MatTooltipModule,
        CommonModule,
    ],
    templateUrl: './list-table.component.html',
    styleUrl: './list-table.component.css'
})
export class ListTableComponent {
    @Input() page: number = 1;
    @Input() search: string = '';
    @Input() loadedCounts: boolean = false;
    @Output() EditCourse = new EventEmitter<ICourse>();
    @Output() DeleteCourse = new EventEmitter<string>();
    @Output() Loaded = new EventEmitter<boolean>();

    rowActive = -1;
    courses: Courses = [];
    loaded = false;

    columns = ['CourseName', 'Location', 'StartDate', 'Length', 'Price'];
  
    getLocation(course: ICourse): string {
        return `${course.Country}, ${course.City}, ${course.University}`;
    }
  
    getStartDate(course: ICourse): string {
        // get timestamp and convert to YYYY-MM-DD format
        const date = new Date(course.StartDate);
        return date.toISOString().split('T')[0];
    }
  
    getLength(course: ICourse): number {
        const start = new Date(course.StartDate);
        const end = new Date(course.EndDate);
        const diff = end.getTime() - start.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return days;
    }
  
    getPrice(course: ICourse): string {
        const symbol = getCurrencySymbol(course.Currency, 'narrow');
        return formatCurrency(course.Price, 'en-US', symbol);
    }
  
    getTooltip(course: ICourse): string {
        return course.CourseDescription;
    }
  
    setCourses(courses: Courses) {
        this.courses = courses;
    }
  
    getCourses() {
        this.loaded = false;
        this.Loaded.emit(false);
        if (this.search) {
            API.search(this.search, this.page).then((data) => {
                this.setCourses(data);
                this.loaded = true;
                this.Loaded.emit(true);
            });
        } else {
            API.page(this.page).then((data) => {
                this.setCourses(data);
                this.loaded = true;
                this.Loaded.emit(true);
            });
        }
    }

    ngOnChanges() {
        this.getCourses();
    }
}
