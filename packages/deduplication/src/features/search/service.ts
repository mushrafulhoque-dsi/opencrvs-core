import { client } from 'src/elasticsearch/client'
import { ISearchQuery } from './types'
import { queryBuilder } from './utils'

const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'

export async function searchComposition(params: ISearchQuery) {
  const {
    query = '',
    event = '',
    status = '',
    from = 0,
    size = DEFAULT_SIZE
  } = params

  return client.search({
    type: DEFAULT_SEARCH_TYPE,
    from: from,
    size: size,
    body: {
      query: queryBuilder(query, { event, status })
    }
  })
}
