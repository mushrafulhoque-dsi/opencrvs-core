import * as React from 'react'
import styled from 'styled-components'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { ITheme } from 'src/components/theme'

const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const ComponentWrapper = styled.span`
  display: flex;
`

const Padding = styled.span`
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.accent};
`

const InputDescription = styled.p<{
  ignoreMediaQuery?: boolean
}>`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.copy};

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export interface IInputFieldProps {
  id: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  optionalLabel: string
  children: React.ReactNode
  ignoreMediaQuery?: boolean
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      id,
      label,
      optionalLabel,
      required = true,
      description,
      error,
      touched,
      ignoreMediaQuery
    } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { children, prefix } = this.props

    return (
      <div>
        <InputHeader>
          {label && (
            <InputLabel
              id={`${id}_label`}
              disabled={this.props.disabled}
              ignoreMediaQuery={ignoreMediaQuery}
            >
              {label}
              {!required && (
                <Optional disabled={this.props.disabled}>
                  &nbsp;&nbsp;•&nbsp;{optionalLabel}
                </Optional>
              )}
            </InputLabel>
          )}
        </InputHeader>

        <ComponentWrapper>
          {prefix && <Padding>{prefix}</Padding>}
          {children}
          {postfix && <Padding>{postfix}</Padding>}
        </ComponentWrapper>

        {error && touched && (
          <InputError
            id={this.props.id + '_error'}
            centred={!this.props.maxLength}
            ignoreMediaQuery={ignoreMediaQuery}
          >
            {error}
          </InputError>
        )}

        {description && (
          <InputDescription ignoreMediaQuery={ignoreMediaQuery}>
            {description}
          </InputDescription>
        )}
      </div>
    )
  }
}
