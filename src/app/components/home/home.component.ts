import { Component, OnInit } from '@angular/core';
import { GlobalDataSummary } from 'src/app/models/global-data';
import { DataServiceService } from 'src/app/services/data-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  dataTable: any = [];
  globalData : GlobalDataSummary[];
  loading = true;

  s: boolean = false;

  chart = {
    PieChart : "PieChart",
    ColumnChart : "ColumnChart",
    height: 500,
    options: {
      hAxis: {
          title: 'Countries'
      },
      vAxis:{
          title: 'Cases'
      },
      animation: {
        duration: 1000,
        easing: 'out'
      },
      is3D: true
    }
  }

  constructor(private dataService: DataServiceService) {  }

  ngOnInit(): void {
    this.dataService.getGlobalData()
      .subscribe(
        {
          next : (result) => {
            this.globalData = result;

            result.forEach(cs => {
              if(!Number.isNaN(cs.confirmed)) {
                this.totalActive += cs.active;
                this.totalConfirmed += cs.confirmed;
                this.totalDeaths += cs.deaths;
                this.totalRecovered += cs.recovered
              }
            });
            this.totalConfirmed = this.numberWithCommas(this.totalConfirmed);
            this.totalActive = this.numberWithCommas(this.totalActive);
            this.totalDeaths = this.numberWithCommas(this.totalDeaths);
            this.totalRecovered = this.numberWithCommas(this.totalRecovered);
            this.initChart('c');
          },
          complete: () => {
            this.loading = false;
          }
        }
      )
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  initChart(caseType : string) {
    this.dataTable = [];
    // Need to fix this - Cannot add first element to be string
    // this.dataTable.push(['Country', 'Cases']);

    this.globalData.forEach(cs => {
      let value: number;
      let countryName: string;
      if(caseType == 'c' )
        if(cs.confirmed > 1000000){
          value = cs.confirmed;
          countryName = cs.country;
          this.dataTable.push([ countryName, value ]);
        }

      if(caseType == 'a')
        if(cs.active > 200000) {
          value = cs.active;
          countryName = cs.country;
          this.dataTable.push([ countryName, value ]);
        }

      if(caseType == 'd')
        if(cs.deaths > 20000) {
          value = cs.deaths;
          countryName = cs.country;
          this.dataTable.push([ countryName, value ]);
        }

      if(caseType == 'r')
        if(cs.recovered > 500000) {
          value = cs.recovered;
          countryName = cs.country;
          this.dataTable.push([ countryName, value ]);
        }
    });
  };

  updateChart(input: HTMLInputElement) {
    console.log(input.value);
    this.initChart(input.value);
  }
}
