import { PriceQueryAction, PriceQueryActionTypes } from './price-query.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PriceQuery, PriceQueryResponse } from './price-query.type';
import { transformPriceQueryResponse, getCurrentISODateCacheKey } from './price-query-transformer.util';

export const PRICEQUERY_FEATURE_KEY = 'priceQuery';

export interface PriceQueryResponseCache {
  [cacheKey: string]: PriceQueryResponse[];
}

export interface PriceQueryState extends EntityState<PriceQuery> {
  selectedSymbol: string;
  priceQueryCache: PriceQueryResponseCache;
}

export function sortByDateNumeric(a: PriceQuery, b: PriceQuery): number {
  return a.dateNumeric - b.dateNumeric;
}

export const priceQueryAdapter: EntityAdapter<PriceQuery> = createEntityAdapter<
  PriceQuery
>({
  selectId: (priceQuery: PriceQuery) => priceQuery.dateNumeric,
  sortComparer: sortByDateNumeric
});

export interface PriceQueryPartialState {
  readonly [PRICEQUERY_FEATURE_KEY]: PriceQueryState;
}

export const initialState: PriceQueryState = priceQueryAdapter.getInitialState({
  selectedSymbol: '',
  priceQueryCache: {}
});

export function priceQueryReducer(
  state: PriceQueryState = initialState,
  action: PriceQueryAction
): PriceQueryState {
  switch (action.type) {
    case PriceQueryActionTypes.PriceQueryFetched: {
      const stateWithCache = {
        ...state,
        priceQueryCache: addQueryCache(action.symbol, action.period, action.queryResults, state.priceQueryCache)
      }

      return priceQueryAdapter.addAll(
        transformPriceQueryResponse(action.queryResults),
        stateWithCache
      );
    }
    case PriceQueryActionTypes.PriceQueryCached: {
      return priceQueryAdapter.addAll(
        transformPriceQueryResponse(action.queryResults),
        state
      );
    }
    case PriceQueryActionTypes.SelectSymbol: {
      return {
        ...state,
        selectedSymbol: action.symbol
      };
    }
  }
  return state;
}

function addQueryCache(symbol: string, period: string, queryResults: Array<PriceQueryResponse>, queryCache: PriceQueryResponseCache): PriceQueryResponseCache {
  const newQueryCache: PriceQueryResponseCache = Object.assign({}, queryCache);

  if (queryResults && queryResults.length > 0) {
    const cacheKey = getCurrentISODateCacheKey(symbol, period);

    newQueryCache[cacheKey] = queryResults;
  }

  return newQueryCache;
}