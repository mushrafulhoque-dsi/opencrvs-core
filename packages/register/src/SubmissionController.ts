import ApolloClient, { ApolloError } from 'apollo-client'
import * as Sentry from '@sentry/browser'
import {
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from './applications'
import { Action, IForm } from './forms'
import { getRegisterForm } from './forms/register/application-selectors'
import { AppStore } from './store'
import { createClient } from './utils/apolloClient'
import { getMutationMapping } from './views/DataProvider/MutationProvider'

const INTERVAL_TIME = 5000
const ALLOWED_STATUS_FOR_RETRY = [
  SUBMISSION_STATUS.READY_TO_SUBMIT.toString(),
  SUBMISSION_STATUS.FAILED_NETWORK.toString()
]

export class SubmissionController {
  private store: AppStore
  private client: ApolloClient<{}>
  private registerForms: { [key: string]: IForm }
  private syncRunning: boolean = false
  private syncCount: number = 0

  constructor(store: AppStore) {
    this.store = store
    this.client = createClient(store)
    this.registerForms = getRegisterForm(this.store.getState())
  }

  public start = () => {
    setInterval(() => {
      this.sync()
    }, INTERVAL_TIME)
  }

  private getApplications = () =>
    this.store.getState().applicationsState.applications || []

  private getSubmitableApplications = () => {
    return this.getApplications().filter(
      app =>
        app.submissionStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.submissionStatus)
    )
  }

  private sync = async () => {
    this.syncCount++
    console.debug(`[${this.syncCount}] Starting sync...`)
    if (!navigator.onLine || this.syncRunning) {
      console.debug(
        `[${this.syncCount}] Sync exiting early (offline or already syncing)`
      )
      return
    }

    this.syncRunning = true

    const applications = this.getSubmitableApplications()
    console.debug(
      `[${this.syncCount}] Syncing ${applications.length} applications`
    )
    for (const application of applications) {
      await this.callMutation(application)
    }

    this.syncRunning = false
    console.debug(`[${this.syncCount}] Finish sync.`)
  }

  private callMutation = async (application: IApplication | undefined) => {
    if (!application) {
      return
    }

    const result = getMutationMapping(
      application.event,
      Action.SUBMIT_FOR_REVIEW,
      null,
      this.registerForms[application.event],
      application
    )
    const { mutation, variables } = result || {
      mutation: null,
      variables: null
    }

    application.submissionStatus = SUBMISSION_STATUS.SUBMITTING
    modifyApplication(application)

    try {
      await this.client.mutate({ mutation, variables })
      this.onSuccess(application)
    } catch (exception) {
      this.onError(application, exception)
    }
  }

  private onSuccess = (application: IApplication) => {
    application.submissionStatus =
      SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]
    this.store.dispatch(modifyApplication(application))
  }

  private onError = (application: IApplication, error: ApolloError) => {
    let status
    if (error.networkError) {
      status = SUBMISSION_STATUS.FAILED_NETWORK
    } else {
      status = SUBMISSION_STATUS.FAILED
      Sentry.captureException(error)
    }

    application.submissionStatus = status
    this.store.dispatch(modifyApplication(application))
  }
}