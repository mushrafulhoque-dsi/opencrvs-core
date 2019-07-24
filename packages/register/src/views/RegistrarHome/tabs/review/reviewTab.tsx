import { Duplicate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable,
  IAction
} from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema'
import { goToPage, goToReviewDuplicate } from '@register/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'
import { getScope } from '@register/profile/profileSelectors'
import { transformData } from '@register/search/transformer'
import { IStoreState } from '@register/store'
import { ITheme } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import { messages } from '@register/views/RegistrarHome/messages'
import { SEARCH_EVENTS } from '@register/views/RegistrarHome/queries'
import {
  ErrorText,
  EVENT_STATUS,
  StyledSpinner
} from '@register/views/RegistrarHome/RegistrarHome'
import { RowHistoryView } from '@register/views/RegistrarHome/RowHistoryView'

interface IBaseReviewTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  registrarUnion: string | null
  parentQueryLoading?: boolean
}

interface IReviewTabState {
  reviewCurrentPage: number
}

type IReviewTabProps = InjectedIntlProps & IBaseReviewTabProps

class ReviewTabComponent extends React.Component<
  IReviewTabProps,
  IReviewTabState
> {
  pageSize = 10
  constructor(props: IReviewTabProps) {
    super(props)
    this.state = {
      reviewCurrentPage: 1
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDeclaredContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)

    return transformedData.map(reg => {
      const actions = [] as IAction[]
      let icon: JSX.Element = <div />
      if (this.userHasRegisterScope()) {
        if (reg.duplicates && reg.duplicates.length > 0) {
          actions.push({
            label: this.props.intl.formatMessage(messages.reviewDuplicates),
            handler: () => this.props.goToReviewDuplicate(reg.id)
          })
          icon = <Duplicate />
        } else {
          actions.push({
            label: this.props.intl.formatMessage(messages.review),
            handler: () =>
              this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
              )
          })
        }
      }

      return {
        ...reg,
        eventTimeElapsed:
          (reg.dateOfEvent &&
            moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
          '',
        applicationTimeElapsed:
          (reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        actions,
        icon
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ reviewCurrentPage: newPageNumber })
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, registrarUnion, parentQueryLoading } = this.props

    return (
      <Query
        query={SEARCH_EVENTS}
        variables={{
          status: EVENT_STATUS.DECLARED,
          locationIds: [registrarUnion],
          count: this.pageSize,
          skip: (this.state.reviewCurrentPage - 1) * this.pageSize
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          if (loading) {
            return (
              (!parentQueryLoading && (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )) ||
              null
            )
          }
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-review">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
          return (
            <BodyContent>
              <GridTable
                content={this.transformDeclaredContent(data)}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 14,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemTrackingNumber
                    ),
                    width: 20,
                    key: 'trackingId'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemApplicationDate
                    ),
                    width: 20,
                    key: 'applicationTimeElapsed'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemEventDate
                    ),
                    width: 20,
                    key: 'eventTimeElapsed'
                  },
                  {
                    width: 6,
                    key: 'icons',
                    isIconColumn: true
                  },
                  {
                    width: 20,
                    key: 'actions',
                    isActionColumn: true,
                    alignment: ColumnContentAlignment.CENTER
                  }
                ]}
                renderExpandedComponent={this.renderExpandedComponent}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={this.state.reviewCurrentPage}
                expandable={true}
              />
            </BodyContent>
          )
        }}
      </Query>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state)
  }
}

export const ReviewTab = connect(
  mapStateToProps,
  {
    goToPage: goToPage,
    goToReviewDuplicate: goToReviewDuplicate
  }
)(injectIntl(withTheme(ReviewTabComponent)))