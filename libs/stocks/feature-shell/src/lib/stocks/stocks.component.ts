import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { debounceTime } from 'rxjs/operators';

const dayInMilli = (24 * 60 * 60 * 1000);

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  datePickerForm: FormGroup;
  isCustomDate = false;
  maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
  minDate = new Date(0);

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
    { viewValue: 'Custom date range', value: 'date' }
  ];

  private static validateStartEndDate(datePickerForm: FormGroup): ValidationErrors | null {
    const startDateControl = datePickerForm ? datePickerForm.controls['startdate'] : undefined;
    const endDateControl = datePickerForm ? datePickerForm.controls['enddate'] : undefined;
    const startDateDate = startDateControl ? startDateControl.value as Date : undefined;
    const endDateDate = endDateControl ? endDateControl.value as Date : undefined;

    if (!startDateDate || !endDateDate) {
      return null;
    }

    const nowTime = Date.now() / dayInMilli * dayInMilli;
    const minimumTime = new Date(0).getTime();

    let startTime = startDateDate ? startDateDate.getTime() / dayInMilli * dayInMilli: minimumTime;
    let endTime = endDateDate ? endDateDate.getTime() / dayInMilli * dayInMilli : nowTime;
    const startTimeOutsideRange = startTime < minimumTime;
    startTime = startTimeOutsideRange ? minimumTime : startTime;
    const endTimeOutsideRange = endTime > nowTime;
    endTime = endTimeOutsideRange ? nowTime : endTime;
  
    if (startTimeOutsideRange) {
      datePickerForm.patchValue({
        startdate: new Date(startTime)
      });
    } else if (endTimeOutsideRange) {
      datePickerForm.patchValue({
        enddate: new Date(endTime)
      });
    }

    if (startTime > endTime) {
      datePickerForm.patchValue({
        startdate: new Date(endTime),
      });
    } else if (endTime < startTime) {
      datePickerForm.patchValue({
        enddate: new Date(startTime),
      });
    }

    return null;
  }


  constructor(fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required]
    });
    const now = new Date(Date.now() / dayInMilli * dayInMilli);
    this.datePickerForm = fb.group({
      startdate: [now],
      enddate: [now]
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
    this.maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
    this.isCustomDate = this.stockPickerForm.controls['period'].value === 'date';
  }

  validateDateInput(event: MatDatepickerInputEvent<Date>): void {
    this.maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
    setTimeout(() => {
      StocksComponent.validateStartEndDate(this.datePickerForm);
      this.fetchQuote();
    }, 2000);
  }

  validateDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
    StocksComponent.validateStartEndDate(this.datePickerForm);
    this.fetchQuote();
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

  private startDateValidator: (control: AbstractControl) => ValidationErrors | null = (control: AbstractControl) => {
    this.maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
    return StocksComponent.validateStartEndDate(control.parent as FormGroup);
  }
  private endDateValidator: (control: AbstractControl) => ValidationErrors | null = (control: AbstractControl) => {
    this.maxDate = new Date(Date.now() / dayInMilli * dayInMilli);
    return StocksComponent.validateStartEndDate(control.parent as FormGroup);
  }
}
