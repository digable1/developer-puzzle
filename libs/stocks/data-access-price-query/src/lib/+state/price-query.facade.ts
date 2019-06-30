import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FetchPriceQuery, FetchPriceQueryDate } from './price-query.actions';
import { PriceQueryPartialState } from './price-query.reducer';
import { getSelectedSymbol, getAllPriceQueries } from './price-query.selectors';
import { map, skip } from 'rxjs/operators';

@Injectable()
export class PriceQueryFacade {
  selectedSymbol$ = this.store.pipe(select(getSelectedSymbol));
  priceQueries$ = this.store.pipe(
    select(getAllPriceQueries),
    skip(1),
    map(priceQueries =>
      priceQueries.map(priceQuery => [priceQuery.date, priceQuery.close])
    )
  );

  constructor(private store: Store<PriceQueryPartialState>) {}

  fetchQuote(symbol: string, period: string, startdate: Date, enddate: Date) {
    if (period === 'date') {
      this.store.dispatch(new FetchPriceQueryDate(symbol, period, startdate, enddate));
    } else {
      this.store.dispatch(new FetchPriceQuery(symbol, period));
    }
  }
}
