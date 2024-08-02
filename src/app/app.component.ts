import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ICourse } from '../types';
import { EditComponent } from './edit/edit.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ListComponent, EditComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  page: number = 1;
  search: string = '';

  onSearch(search: string) {
    this.search = search;
  }
  onPageChange(page: number) {
    this.page = page;
  }
}
