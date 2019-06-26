import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleChartsModule } from 'angular-google-charts';
import { of } from 'rxjs';

import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GoogleChartsModule.forRoot()],
      declarations: [ ChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    component.data$ = of([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate basic chart scaffolding as a result of ngInit(), allowing for changes in wording', () => {
    expect(component.chart.type).toBe('LineChart');
    expect(typeof component.chart.title).toBe('string');
    expect(typeof component.chart.data).toBe('object');
    expect(component.chart.columnNames.length).toBe(2);
  })
});
