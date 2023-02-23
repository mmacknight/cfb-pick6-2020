import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'schoolSort'})
export class SchoolSortPipe implements PipeTransform {
  transform(value: any[], criteria: string): any[] {
    if (criteria == "school") {
      return value.sort((s1,s2) => s1[criteria] > s2[criteria] ? 1 : -1);
    } else {
      return value.sort((s1,s2) => {

        if (s1[criteria] < s2[criteria]) {
          return 1;
        }
        if (s1[criteria] > s2[criteria]) {
          return -1;
        }
        if (s1[criteria] == s2[criteria]) {
          return s1["school"] > s2["school"] ? 1 : -1;
        }

      });
    }
  }
}
