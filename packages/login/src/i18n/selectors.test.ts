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
import { getLanguage, getMessages } from '@login/i18n/selectors'
import { mockState } from '@login/tests/util'
import { BENGALI_STATE } from '@login/i18n/locales/bn'

describe('intl selectors', () => {
  describe('getLanguage', () => {
    it('should return language locale string', () => {
      const locale = 'bn'
      expect(getLanguage(mockState)).toEqual(locale)
    })
  })
  describe('getMessages', () => {
    it('should return messages object', () => {
      const messages = BENGALI_STATE.messages
      expect(getMessages(mockState)).toEqual(messages)
    })
  })
})
