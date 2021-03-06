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
import styled from 'styled-components'
import { Button, IButtonProps } from './Button'
import { PlusTransparent, MinusTransparent } from '../icons'

export const StyledButton = styled(Button)`
  border: none;
  background: none;
  height: 40px;
  width: 40px;
  display: flex;
  border-radius: 100%;
  &:hover {
    background-color: ${({ theme }) => theme.colors.dropdownHover};
  }
  &:not([data-focus-visible-added]):hover {
    background-color: ${({ theme }) => theme.colors.dropdownHover};
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: none;
    outline: none;
    color: ${({ color = '#4C68C1' }) => color};
  }
  &:active:not([data-focus-visible-added]) {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
`
export interface IExpansionButtonProps extends IButtonProps {
  expanded?: boolean
}

export function ExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      icon={() => {
        return props.expanded ? <MinusTransparent /> : <PlusTransparent />
      }}
      {...props}
    />
  )
}
