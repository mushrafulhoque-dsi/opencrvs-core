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
import * as React from 'react'
import { UserSetupPage } from '@register/views/UserSetup/UserSetupPage'
import { CreatePassword } from '@register/views/UserSetup/CreatePassword'
import { SecurityQuestion } from '@register/views/UserSetup/SecurityQuestionView'
import { UserSetupReview } from '@register/views/UserSetup/SetupReviewPage'
import { SetupConfirmationPage } from '@register/views/UserSetup/SetupConfirmationPage'
export const SCREEN_LOCK = 'screenLock'

export enum ProtectedAccoutStep {
  LANDING,
  PASSWORD,
  SECURITY_QUESTION,
  REVIEW,
  CONFIRMATION
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answer: string
}
export interface IProtectedAccountSetupData {
  userId?: string
  password?: string
  securityQuestionAnswers?: ISecurityQuestionAnswer[]
}

interface IProtectAccountState {
  currentStep: ProtectedAccoutStep
  setupData: IProtectedAccountSetupData
}

export class ProtectedAccount extends React.Component<
  {},
  IProtectAccountState
> {
  constructor(props: {}) {
    super(props)
    this.state = {
      currentStep: ProtectedAccoutStep.LANDING,
      setupData: {}
    }
    this.goToStep = this.goToStep.bind(this)
  }

  goToStep(step: ProtectedAccoutStep, data: IProtectedAccountSetupData) {
    this.setState(() => ({
      currentStep: step,
      setupData: data
    }))
  }

  render() {
    const { currentStep, setupData } = this.state
    switch (currentStep) {
      case ProtectedAccoutStep.LANDING:
        return <UserSetupPage goToStep={this.goToStep} setupData={setupData} />
      case ProtectedAccoutStep.PASSWORD:
        return <CreatePassword goToStep={this.goToStep} setupData={setupData} />
      case ProtectedAccoutStep.SECURITY_QUESTION:
        return (
          <SecurityQuestion goToStep={this.goToStep} setupData={setupData} />
        )
      case ProtectedAccoutStep.REVIEW:
        return (
          <UserSetupReview goToStep={this.goToStep} setupData={setupData} />
        )
      case ProtectedAccoutStep.CONFIRMATION:
        return <SetupConfirmationPage />
    }
  }
}
