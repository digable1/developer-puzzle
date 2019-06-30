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
  FetchPriceQueryDate,
  PriceQueryActionTypes,
  PriceQueryFetched,
  PriceQueryDateFetched,
  PriceQueryFetchError,
  PriceQueryCached
} from './price-query.actions';
import { PriceQueryPartialState, PRICEQUERY_FEATURE_KEY } from './price-query.reducer';
import { PriceQueryResponse } from './price-query.type';
import { getCurrentISODateCacheKey, priceQueryResponseBlank } from './price-query-transformer.util';

const dayInMilli = (24 * 60 * 60 * 1000);

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
            `${this.env.apiURL}/beta/stock/${action.symbol}/chart/${action.period}?token=${this.env.apiKey}`
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

  @Effect() loadPriceQueryDate$ = this.dataPersistence.fetch(
    PriceQueryActionTypes.FetchPriceQueryDate,
    {
      run: (action: FetchPriceQueryDate, state: PriceQueryPartialState) => {
        const maxPeriod = 'max';
        const cachedPriceQuery = state[PRICEQUERY_FEATURE_KEY].priceQueryCache[getCurrentISODateCacheKey(action.symbol, maxPeriod)];

        const dateWindow = (startDate: Date, endDate: Date, resp: Array<PriceQueryResponse>) => {
          const windowQuery: Array<PriceQueryResponse> = [];
          const startTime = new Date(startDate).getTime() / dayInMilli * dayInMilli;
          const endTime = (new Date(endDate).getTime() / dayInMilli * dayInMilli) + (dayInMilli - 1);
          resp.forEach((response) => {
            const queryTime = (new Date(response.date).getTime() / dayInMilli * dayInMilli) + (dayInMilli / 2);
            if (queryTime > startTime && queryTime <= endTime) {
              windowQuery.push(response);
            }
          });
          if (windowQuery.length < 1) {
            windowQuery.push(priceQueryResponseBlank);
          }
          return windowQuery;
        };

        if (cachedPriceQuery) {
          return of(new PriceQueryCached(dateWindow(action.startdate, action.enddate, cachedPriceQuery)));
        } else {
          return this.httpClient
          .get<Array<PriceQueryResponse>>(
            `${this.env.apiURL}/beta/stock/${action.symbol}/chart/${maxPeriod}?token=${this.env.apiKey}`
          )
          .pipe(
            map(resp => new PriceQueryDateFetched(action.symbol, maxPeriod, resp, dateWindow(action.startdate, action.enddate, resp))),
          );
        }
      },

      onError: (action: FetchPriceQueryDate, error) => {
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
