import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldControl } from '@angular/material';
import { FormBuilder } from '@angular/forms';

import { provideMockStore } from '@ngrx/store/testing';

import { GoogleChartsModule } from 'angular-google-charts';

import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { StocksComponent } from './stocks.component';

// tslint:disable-next-line: nx-enforce-module-boundaries
describe('StocksComponent', () => {
  const initialState = {
    selectedSymbol: ''
  };
  let component: StocksComponent;
  let fixture: ComponentFixture<StocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        GoogleChartsModule
      ],
      providers: [
        FormBuilder,
        PriceQueryFacade,
        MatFormFieldControl,
        provideMockStore({ initialState })
      ],
      declarations: [ StocksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
