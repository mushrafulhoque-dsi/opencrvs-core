/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { resolvers } from '@gateway/features/location/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Location root resolvers', () => {
  describe('locationsByParent()', () => {
    it('returns an array of location results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.locationsByParent(
        {},
        { parentId: '1' }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  describe('locationById()', () => {
    it('returns a location object', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Location' }))
      // @ts-ignore
      const composition = await resolvers.Query.locationById(
        {},
        { locationId: '1' }
      )

      expect(composition).toBeDefined()
    })
  })
})
