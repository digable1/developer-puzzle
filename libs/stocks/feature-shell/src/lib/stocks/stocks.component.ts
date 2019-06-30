import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { debounceTime } from 'rxjs/operators';

const dayInMilli = (24 * 60 * 60 * 1000);
const minimumTime = (30 * dayInMilli);

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  datePickerForm: FormGroup;
  isCustomDate = false;
  nowDate = Date.now();
  minDate = new Date((this.nowDate - minimumTime) / dayInMilli * dayInMilli);
  maxDate = new Date(this.nowDate / dayInMilli * dayInMilli);

  quotes$ = this.priceQuery.priceQueries$;

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' },
    { viewValue: 'Custom date range', value: 'custom' }
  ];

  private static validateStartEndDate(datePickerForm: FormGroup): ValidationErrors | null {
    const startDateControl = datePickerForm ? datePickerForm.controls['startdate'] : undefined;
    const endDateControl = datePickerForm ? datePickerForm.controls['enddate'] : undefined;
    const startDateDate = startDateControl ? startDateControl.value as Date : undefined;
    const endDateDate = endDateControl ? endDateControl.value as Date : undefined;

    if (!startDateDate || !endDateDate) {
      return null;
    }

    setTimeout(() => {
      const nowDay = Date.now() / dayInMilli;
      const minimumDay = (nowDay - minimumTime) / dayInMilli;
  
      let startTime = startDateDate ? startDateDate.getTime() / dayInMilli: minimumDay;
      let endTime = endDateDate ? endDateDate.getTime() / dayInMilli : nowDay;
      const invalidStartRange = (startTime < minimumDay || startTime > nowDay);
      const invalidEndRange = (endTime < startTime || endTime < minimumDay || endTime > nowDay);
  
      startTime = startTime < minimumDay ? minimumDay : startTime;
      startTime = startTime > nowDay ? nowDay : startTime;
  
      endTime = endTime > nowDay ? nowDay : endTime;
      endTime = endTime < minimumDay ? minimumDay : endTime;
  
  
      if (invalidStartRange) {
        datePickerForm.patchValue({
          startdate: new Date(startTime * dayInMilli)
        });
      }
      if (invalidEndRange) {
        datePickerForm.patchValue({
          enddate: new Date(startTime * dayInMilli)
        });
      }
    }, 1000);

    return null;
  }


  constructor(fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    const now = new Date(Date.now() / dayInMilli * dayInMilli);
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required]
    });
    this.datePickerForm = fb.group({
      startdate: [new Date((now.getTime() - minimumTime) / dayInMilli * dayInMilli), this.startDateValidator],
      enddate: [now, this.endDateValidator]
    })
  }

  ngOnInit() {
    this.onChanges();
  }

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const { symbol, period } = this.stockPickerForm.value;
      const { startdate, enddate } = this.datePickerForm.value;
      this.priceQuery.fetchQuote(symbol, period, startdate, enddate);
    }
  }

  checkCustomDate(): void {
    this.isCustomDate = this.stockPickerForm.controls['period'].value === 'custom';
  }

  private onChanges(): void {
    this.stockPickerForm.valueChanges
      .pipe(debounceTime(10))
      .subscribe(
        (value) => {
          if (typeof value.symbol === 'string' && typeof value.period === 'string') {
            this.fetchQuote();
          }
        }
      );
  }

  private startDateValidator(control: AbstractControl): ValidationErrors | null {
    return StocksComponent.validateStartEndDate(control.parent as FormGroup);
  }
  private endDateValidator(control: AbstractControl): ValidationErrors | null {
    return StocksComponent.validateStartEndDate(control.parent as FormGroup);
  }
}
