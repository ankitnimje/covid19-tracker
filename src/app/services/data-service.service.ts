import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators'
import { GlobalDataSummary } from '../models/global-data';
import { DateWiseData } from '../models/date-wise-data';

@Injectable({
  providedIn: 'root'
})

export class DataServiceService {

  private baseUrl = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/`;
  private globalDataUrl = ``;
  private extension = '.csv';
  dd;
  mm;
  yyyy;

  getDate(date: number) {
    if(date < 10) {
      return '0' + date;
    }
    return date;
  }

  private dateWiseDataUrl = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`;

  constructor( private http: HttpClient ) {
    let today = new Date();
    this.dd = String(today.getDate()).padStart(2, '0');
    this.mm = String(today.getMonth() + 1).padStart(2, '0');
    this.yyyy = today.getFullYear();

    let todayUrl = this.getDate(this.mm) + '-' + this.getDate(this.dd) + '-' + this.yyyy;

    console.log(todayUrl);


    this.globalDataUrl = `${this.baseUrl}${todayUrl}${this.extension}`;


   }

  getDateWiseData() {
    return this.http.get(this.dateWiseDataUrl, { responseType: 'text' })
      .pipe(map(result => {
        let rows = result.split('\n');

        // console.log(rows);
        let mainData = {};
        let header = rows[0];
        let dates = header.split(/,(?=\S)/)
        dates.splice(0 , 4);
        rows.splice(0 , 1);
        rows.forEach(row=>{
          let cols = row.split(/,(?=\S)/)
          let con = cols[1];
          cols.splice(0 , 4);
          // console.log(con , cols);
          mainData[con] = [];
          cols.forEach((value , index)=>{
            let dw : DateWiseData = {
              cases : +value ,
              country : con ,
              date : new Date(Date.parse(dates[index]))

            }
            mainData[con].push(dw)
          })

        })
        return mainData;
      }))
  }

  getGlobalData() {
    return this.http.get(this.globalDataUrl, {responseType: 'text'}).pipe(
      map(result=>{
        let data: GlobalDataSummary[] = [];
        let raw = {}
        let rows = result.split('\n');
        rows.splice(0,1);
        // console.log(rows);
        rows.forEach(row => {
          let cols = row.split(/,(?=\S)/);

          let cs = {
            country : cols[3],
            confirmed : +cols[7],
            deaths : +cols[8],
            recovered : +cols[9],
            active : +cols[10]
          }
          let temp : GlobalDataSummary = raw[cs.country];
          if(temp){
            temp.active = cs.active + temp.active;
            temp.confirmed = cs.confirmed + temp.confirmed;
            temp.deaths = cs.deaths + temp.deaths;
            temp.recovered = cs.recovered + temp.recovered;

            raw[cs.country] = temp;
          } else {
            raw[cs.country] = cs;
          }
        })
        // console.log(raw);

        return <GlobalDataSummary[]>Object.values(raw);
      }),
      catchError((error: HttpErrorResponse) => {
        if(error.status == 404) {
          this.dd = this.dd - 1;
          let todayUrl = this.getDate(this.mm) + '-' + this.getDate(this.dd) + '-' + this.yyyy;
          this.globalDataUrl = `${this.baseUrl}${todayUrl}${this.extension}`;

          return this.getGlobalData();
        }
      })
    )
  }
}
