import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  // TODO: Discuss modifying prefix in angular.json
  selector: 'coding-challenge-line-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @Input() data$: Observable<any>;
  @Input() title: string;
  @Input() columnNames: Array<string>;
  @Input() width: number;
  @Input() height: number;

  chartData: any;

  chart: {
    title: string;
    type: string;
    data: any;
    columnNames: string[];
    width: number;
    height: number;
  };
  constructor(cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.chart = {
      type: 'LineChart',
      data: [],
      title: this.title || `Stock price`,
      columnNames: this.columnNames || ['period', 'close'],
      width: this.width || 600,
      height: this.height || 400
    };

    this.data$.subscribe(newData => (this.chartData = newData));
  }
}
