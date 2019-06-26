import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  StocksAppConfig,
  StocksAppConfigToken
} from '@coding-challenge/stocks/data-access-app-config';
import { Effect } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FetchPriceQuery,
  PriceQueryActionTypes,
  PriceQueryFetched,
  PriceQueryFetchError,
  PriceQueryCached
} from './price-query.actions';
import { PriceQueryPartialState, PRICEQUERY_FEATURE_KEY } from './price-query.reducer';
import { PriceQueryResponse } from './price-query.type';
import { getCurrentISODateCacheKey } from './price-query-transformer.util';

@Injectable()
export class PriceQueryEffects {
  @Effect() loadPriceQuery$ = this.dataPersistence.fetch(
    PriceQueryActionTypes.FetchPriceQuery,
    {
      run: (action: FetchPriceQuery, state: PriceQueryPartialState) => {
        const cachedPriceQuery = state[PRICEQUERY_FEATURE_KEY].priceQueryCache[getCurrentISODateCacheKey(action.symbol, action.period)];

        if (cachedPriceQuery) {
          return of(new PriceQueryCached(cachedPriceQuery));
        } else {
          return this.httpClient
          .get<Array<PriceQueryResponse>>(
            `${this.env.apiURL}/beta/stock/${action.symbol}/chart/${
              action.period
            }?token=${this.env.apiKey}`
          )
          .pipe(
            map(resp => new PriceQueryFetched(action.symbol, action.period, resp))
          );
        }
      },

      onError: (action: FetchPriceQuery, error) => {
        return new PriceQueryFetchError(error);
      }
    }
  );

  constructor(
    @Inject(StocksAppConfigToken) private env: StocksAppConfig,
    private httpClient: HttpClient,
    private dataPersistence: DataPersistence<PriceQueryPartialState>
  ) {}
}
