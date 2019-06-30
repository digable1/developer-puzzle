import { Action } from '@ngrx/store';
import { PriceQueryResponse } from './price-query.type';

export enum PriceQueryActionTypes {
  SelectSymbol = 'priceQuery.selectSymbol',
  FetchPriceQuery = 'priceQuery.fetch',
  FetchPriceQueryDate = 'priceQuery.fetchDate',
  PriceQueryFetched = 'priceQuery.fetched',
  PriceQueryDateFetched = 'priceQuery.dateFetched',
  PriceQueryCached = 'priceQuery.cached',
  PriceQueryFetchError = 'priceQuery.error'
}

export class FetchPriceQuery implements Action {
  readonly type = PriceQueryActionTypes.FetchPriceQuery;
  constructor(public symbol: string, public period: string) {}
}

export class FetchPriceQueryDate implements Action {
  readonly type = PriceQueryActionTypes.FetchPriceQueryDate;
  constructor(public symbol: string, public period: string, public startdate: Date, public enddate: Date) {}
}

export class PriceQueryFetchError implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryFetchError;
  constructor(public error: any) {}
}

export class PriceQueryFetched implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryFetched;
  constructor(public symbol: string, public period: string, public queryResults: PriceQueryResponse[]) {}
}

export class PriceQueryDateFetched implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryDateFetched;
  constructor(public symbol: string, public period: string, public queryResults: PriceQueryResponse[], public dateResults: PriceQueryResponse[]) {}
}

export class PriceQueryCached implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryCached;
  constructor(public queryResults: PriceQueryResponse[]) {}
}

export class SelectSymbol implements Action {
  readonly type = PriceQueryActionTypes.SelectSymbol;
  constructor(public symbol: string) {}
}

export type PriceQueryAction =
  | FetchPriceQuery
  | PriceQueryFetched
  | PriceQueryDateFetched
  | PriceQueryCached
  | PriceQueryFetchError
  | SelectSymbol;

export const fromPriceQueryActions = {
  FetchPriceQuery,
  FetchPriceQueryDate,
  PriceQueryFetched,
  PriceQueryCached,
  PriceQueryFetchError,
  SelectSymbol
};
