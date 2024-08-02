import { Component, EventEmitter, Input, Output } from '@angular/core';
import { API } from '../../data';
import { ICourse, IPagesResponse } from '../../types';
import { ListTableComponent } from '../list-table/list-table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ListPaginationComponent } from '../list-pagination/list-pagination.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { EditComponent } from '../edit/edit.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    ListTableComponent,
    ListPaginationComponent,
    CommonModule,
    EditComponent,
],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
    @Input() page: number = 1;
    @Input() search: string = '';
    @Output() PageChange = new EventEmitter<number>();
    @Output() SearchChange = new EventEmitter<string>();

    lastSearch: string = '';
    loaded = false;
    loadedClasses = false;
    pages = 0;
    limit = 10;
    count = 0;
    searchDelay = 500;
    searchTimeout: any = null;

    editor: boolean = false;
    editCourse: ICourse | null = null;

    hasLoadedClasses(loaded: boolean) {
        this.loadedClasses = loaded;
    }

    updateCourse(course: ICourse) {
        this.editCourse = course;
        this.editor = true;
    }

    addCourse() {
        this.editCourse = {
            CourseName: '',
            CourseDescription: '',
            University: '',
            City: '',
            Country: '',
            StartDate: '',
            EndDate: '',
            Price: 0,
            Currency: 'USD'
        };
        this.editor = true;
    }

    cancelCourse() {
        this.editCourse = null;
        this.editor = false;
    }

    onPageChange(page: number) {
        this.page = page;
        this.PageChange.emit(page);
    }

    deleteCourse(id: string) {
        API.remove(id).then(() => {
            this.ngOnChanges();
        });
    }

    setCounts(data: IPagesResponse) {
        this.pages = data.pages;
        this.limit = data.limit;
        this.count = data.count;
    }

    getCounts() {
        this.loaded = false;
        if (this.search) {
            API.searchCount(this.search).then((data) => {
                this.setCounts(data);
                this.loaded = true;
            });
        } else {
            API.count().then((data) => {
                this.setCounts(data);
                this.loaded = true;
            });
        }
    }
    // query is an input event from the search bar
    onSearch(event: any) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.search = event.target.value;
            this.SearchChange.emit(this.search);
        }, this.searchDelay);
    }

    ngOnChanges() {
        if (this.search !== this.lastSearch) {
            this.page = 1;
            this.PageChange.emit(this.page);
            this.lastSearch = this.search;
        }
        this.getCounts();
    }
}
