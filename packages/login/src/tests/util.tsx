import * as React from 'react'
import { mount, configure, ReactWrapper } from 'enzyme'
import { Provider } from 'react-redux'
import * as Adapter from 'enzyme-adapter-react-16'
import * as en from 'react-intl/locale-data/en'
import { ThemeProvider } from 'styled-components'
import { addLocaleData } from 'react-intl'

import { getTheme } from '@opencrvs/components/lib/theme'

import { App, store } from '../App'
import { IStoreState, createStore } from '../store'
import { config } from '../config'
import { IntlContainer } from '../i18n/components/I18nContainer'

configure({ adapter: new Adapter() })
addLocaleData([...en])

export const mockState: IStoreState = createStore().getState()

export function createTestApp(): ReactWrapper<{}, {}> {
  return mount<App>(<App />)
}

export function createTestComponent(node: React.ReactElement<object>) {
  return mount(
    <Provider store={store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme(config.LOCALE)}>{node}</ThemeProvider>
      </IntlContainer>
    </Provider>
  )
}

export const wait = () => new Promise(res => process.nextTick(res))