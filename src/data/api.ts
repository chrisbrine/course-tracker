import { IPagesResponse, Courses, ICourse } from "../types";

export class API {
  static url() {
    // return 'http://localhost:3000';
    const url = window.location.href;
    // remove index.html if it is in the url
    if (url.endsWith('index.html')) {
      return url.slice(0, -10);
    }
    return url;
  }
  static async count(): Promise<IPagesResponse> {
    const response = await fetch(`${API.url()}/page`);
    const data = await response.json();
    return data;
  }
  static async page(page: number): Promise<Courses> {
    const response = await fetch(`${API.url()}/page/${page}`);
    const data = await response.json();
    return data;
  }
  static async searchCount(search: string): Promise<IPagesResponse> {
    const response = await fetch(`${API.url()}/search/${search}`);
    const data = await response.json();
    return data;
  }
  static async search(search: string, page: number): Promise<Courses> {
    const response = await fetch(`${API.url()}/search/${search}/${page}`);
    const data = await response.json();
    return data;
  }
  static async add(course: ICourse): Promise<boolean> {
    const response = await fetch(`${API.url()}/add`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    const data = await response.json();
    return data.success;
  }
  static async autocomplete(field: string, value: string): Promise<string[]> {
    const response = await fetch(`${API.url()}/autocomplete/${field}/${value}`);
    const data = await response.json();
    return data.data || [];
  }
  static async currencyCodes(): Promise<string[]> {
    const response = await fetch(`${API.url()}/countryCodes`);
    const data = await response.json();
    return data.data || [];
  }
  static async getCurrency(code: string): Promise<string> {
    const response = await fetch(`${API.url()}/countryCodes/${code}`);
    const data = await response.json();
    return data.data || '';

  }
  static async remove(id: string): Promise<boolean> {
    const response = await fetch(`${API.url()}/delete/${id}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.success;
  }
  static async update(id: string, course: ICourse): Promise<boolean> {
    delete course._id;
    const response = await fetch(`${API.url()}/update/${id}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    const data = await response.json();
    return data.success;
  }
}
