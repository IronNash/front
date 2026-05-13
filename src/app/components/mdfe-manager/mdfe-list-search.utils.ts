import { MdfeRow } from '../../dashboard.models';
import { normalizeText } from '../cte-manager/cte-list-filter.utils';

/** Same idea as the CTe list quick search: one string, match across visible columns. */
export function filterMdfeRows(rows: MdfeRow[], rawSearch: string): MdfeRow[] {
  const q = normalizeText(rawSearch.trim());
  if (!q) {
    return rows;
  }
  return rows.filter((row) => {
    const blob = normalizeText(
      [
        row.emission,
        row.number,
        row.route,
        row.plate,
        row.cargoValue,
        row.cargoWeight,
        row.documents,
        row.status,
      ].join(' ')
    );
    return blob.includes(q);
  });
}
