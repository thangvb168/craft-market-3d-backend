interface Query {
  [key: string]: any;
}

interface Opts {
  blacklist?: string[];
  [key: string]: any;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_CURRENT = 1;

const RESERVED_KEYS = ['pageSize', 'current', 'sort', 'fields', 'search'];

/**
 * Builds a Mongoose query object from the provided query parameters and options.
 *
 * @param query - An object containing the query parameters.
 * @param opts - An optional object containing additional options.
 * @param opts.blacklist - An optional array of keys to exclude from the query.
 *
 * @returns An object containing the following properties:
 * - `filter`: The Mongoose filter object.
 * - `skip`: The number of documents to skip (for pagination).
 * - `limit`: The maximum number of documents to return (for pagination).
 * - `sort`: The sort order for the query (if specified).
 * - `projection`: The fields to include or exclude in the result (if specified).
 */
const bmq = (query: Query, opts: Opts = {}) => {
  opts.blacklist = opts.blacklist || [];

  let limit: number;
  try {
    limit = Number(query.pageSize || DEFAULT_LIMIT);
  } catch (error) {
    limit = DEFAULT_LIMIT;
  }

  let current: number;
  try {
    current = Number(query.current || DEFAULT_CURRENT);
  } catch (error) {
    current = DEFAULT_CURRENT;
  }

  const skip = (current - 1) * limit;

  const filter: Record<string, any> = {};

  Object.entries(query).forEach(([key, value]) => {
    if ([...RESERVED_KEYS, ...opts.blacklist].includes(key)) {
      return;
    }

    if (typeof value === 'string') {
      if (value.startsWith('gt:')) {
        filter[key] = { $gt: parseFloat(value.slice(3)) };
        return;
      }

      if (value.startsWith('gte:')) {
        filter[key] = { $gte: parseFloat(value.slice(4)) };
        return;
      }

      if (value.startsWith('lt:')) {
        filter[key] = { $lt: parseFloat(value.slice(3)) };
        return;
      }

      if (value.startsWith('lte:')) {
        filter[key] = { $lte: parseFloat(value.slice(4)) };
        return;
      }

      if (value.startsWith('ne:')) {
        filter[key] = { $ne: value.slice(3) };
        return;
      }

      if (value.startsWith('in:')) {
        filter[key] = { $in: value.slice(3).split(',') };
        return;
      }

      if (value.startsWith('regex:')) {
        filter[key] = { $regex: new RegExp(value.slice(6), 'i') };
        return;
      }
    }

    if (key === 'search' && value) {
      filter.$text = { $search: value };
      return;
    }

    filter[key] = value;
  });

  let sort = {};
  if (query.sort) {
    sort = query.sort
      .split(',')
      .reduce((acc: Record<string, number>, field: string) => {
        const order = field.startsWith('-') ? -1 : 1;
        const key = field.startsWith('-') ? field.slice(1) : field;
        acc[key] = order;
        return acc;
      }, {});
  }

  let projection = {};
  if (query.fields) {
    projection = query.fields
      .split(',')
      .reduce((acc: Record<string, number>, field: string) => {
        acc[field] = 1;
        return acc;
      }, {});
  }

  return {
    filter,
    skip,
    limit,
    sort: Object.keys(sort).length ? sort : undefined,
    projection: Object.keys(projection).length ? projection : undefined,
  };
};

export { bmq };
export default bmq;
