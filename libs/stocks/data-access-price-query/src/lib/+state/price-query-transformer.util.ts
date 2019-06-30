import { PriceQueryResponse, PriceQuery } from './price-query.type';
import { map, pick } from 'lodash-es';
import { parse } from 'date-fns';

export const priceQueryResponseBlank: PriceQueryResponse = {
  date: '',
  open: 0,
  close: 0,
  high: 0,
  low: 0,
  volume: 0,
  uOpen: 0,
  uClose: 0,
  uHigh: 0,
  uLow: 0,
  uVolume: 0,
  change: 0,
  changePercent: 0,
  label: '',
  changeOverTime: 0
};

export const priceQueryBlank: PriceQuery = {
  date: '',
  open: 0,
  close: 0,
  high: 0,
  low: 0,
  volume: 0,
  change: 0,
  changePercent: 0,
  label: '',
  changeOverTime: 0,
  dateNumeric: 0
};

export function transformPriceQueryResponse(
  response: PriceQueryResponse[]
): PriceQuery[] {
  return map(
    response,
    responseItem =>
      ({
        ...pick(responseItem, [
          'date',
          'open',
          'high',
          'low',
          'close',
          'volume',
          'change',
          'changePercent',
          'label',
          'changeOverTime'
        ]),
        dateNumeric: parse(responseItem.date).getTime()
      } as PriceQuery)
  );
}

export function getISODate(d: Date): string {
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString(); // getMonth() is zero-based
  const dd  = d.getDate().toString();
  return `${yyyy}-${mm[1] ? mm : "0" + mm[0]}-${dd[1] ? dd : "0" + dd[0]}`;
}

export function getCurrentISODate(): string {
  return getISODate(new Date());
}

export function getCacheKey(symbol: string, period: string, isoDateString: string): string {
  return `${symbol}-${period}-${isoDateString}`
}

export function getCurrentISODateCacheKey(symbol: string, period: string): string {
  return getCacheKey(symbol, period, getCurrentISODate());
}
