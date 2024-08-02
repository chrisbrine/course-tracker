import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './list-pagination.component.html',
  styleUrl: './list-pagination.component.css'
})
export class ListPaginationComponent {
    @Input() page: number = 1;
    @Input() pages: number = 1;
    @Input() count: number = 0;
    @Input() limit: number = 10;
    @Input() loaded: boolean = false;
    @Input() showPages: number = 10;
    @Output() PageChange = new EventEmitter<number>();

    pagesArray: number[] = [];

    goToPage(page: number) {
        if (page < 1) {
            page = 1;
        } else if (page > this.pages) {
            page = this.pages;
        }
        this.PageChange.emit(page);
    }

    ngOnChanges() {
        let currentPage = Math.max(1, this.page - Math.floor(this.showPages / 2));
        this.pagesArray = [];
        for (let i = 0; i < this.showPages; i++) {
            if (currentPage > this.pages) {
                break;
            }
            this.pagesArray.push(currentPage++);
        }
        currentPage = this.pagesArray[0] - 1;
        while ((this.pagesArray.length < this.showPages) && currentPage > 0) {
            this.pagesArray.unshift(currentPage--);

        }
    }
}
