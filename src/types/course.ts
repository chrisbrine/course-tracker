export interface ICourse {
  _id?: string;
  University: string;
  City: string;
  Country: string;
  CourseName: string;
  CourseDescription: string;
  StartDate: string;
  EndDate: string;
  Price: number;
  Currency: string;
}

export type Courses = ICourse[];
