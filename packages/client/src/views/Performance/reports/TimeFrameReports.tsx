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
import { ListTable } from '@opencrvs/components/lib/interface'
import { constantsMessages } from '@client/i18n/messages'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { GQLBirthRegistrationTimeFrameMetrics } from '@opencrvs/gateway/src/graphql/schema'
import { Event } from '@client/forms'
import {
  getValueWithPercentageString,
  getLocationFromPartOfLocationId
} from './utils'

interface IStateProps {
  offlineResources: IOfflineData
}

type FullProps = {
  data: GQLBirthRegistrationTimeFrameMetrics[]
  eventType: Event
  loading: boolean
} & IStateProps &
  WrappedComponentProps

class TimeFrameComponent extends React.Component<FullProps> {
  getLocationByLocationId = (locationId: string) => {
    const id = (locationId && locationId.split('/')[1]) || ''
    return (
      Object.values(this.props.offlineResources.locations).find(
        location => location.id === id
      ) || {
        name: ''
      }
    )
  }

  getContent = () => {
    return this.props.data.map(timeFrame => ({
      location: getLocationFromPartOfLocationId(
        timeFrame.locationId,
        this.props.offlineResources
      ).name,
      regWithin45d: getValueWithPercentageString(
        timeFrame.regWithin45d,
        timeFrame.total
      ),
      regWithin45dTo1yr: getValueWithPercentageString(
        timeFrame.regWithin45dTo1yr,
        timeFrame.total
      ),
      regWithin1yrTo5yr: getValueWithPercentageString(
        timeFrame.regWithin1yrTo5yr,
        timeFrame.total
      ),
      regOver5yr: getValueWithPercentageString(
        timeFrame.regOver5yr,
        timeFrame.total
      ),
      total: String(timeFrame.total)
    }))
  }

  render() {
    const { intl, loading, eventType } = this.props

    return (
      <ListTable
        tableTitle={intl.formatMessage(constantsMessages.timeFramesTitle, {
          event: eventType
        })}
        isLoading={loading}
        content={this.getContent()}
        columns={[
          {
            label: intl.formatMessage(constantsMessages.location),
            width: 25,
            key: 'location',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.within45Days),
            width: 15,
            key: 'regWithin45d',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.within45DaysTo1Year),
            width: 15,
            key: 'regWithin45dTo1y',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.within1YearTo5Years),
            width: 15,
            key: 'regWithin1yrTo5yr',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.over5Years),
            width: 15,
            key: 'regOver5yr',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.total),
            width: 15,
            key: 'total',
            isSortable: false
          }
        ]}
        noResultText={intl.formatMessage(constantsMessages.noResults)}
      />
    )
  }
}

export const TimeFrameReports = connect(
  (store: IStoreState) => {
    return {
      offlineResources: getOfflineData(store)
    }
  },
  {}
)(injectIntl(TimeFrameComponent))
