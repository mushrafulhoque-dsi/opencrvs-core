import * as React from 'react'
import { ThemeProvider } from 'styled-components'
import { LocaleThemes } from './LocaleThemes'

const locale = process.env.REACT_APP_LOCALE
  ? process.env.REACT_APP_LOCALE
  : 'gb'

export class ThemeWrapper extends React.Component {
  render() {
    return (
      <ThemeProvider theme={LocaleThemes[locale]}>
        {this.props.children}
      </ThemeProvider>
    )
  }
}

// Styleguidist's styleguideComponents configuration only works with components that are default exports
// See packages/components/styleguide.config.js:16
export { ThemeWrapper as default }
