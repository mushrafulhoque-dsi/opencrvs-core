import { createServer } from '../../..'
import * as codeService from '@auth/features/verifyCode/service'
import * as retrievalService from '@auth/features/retrievalSteps/verifyUser/service'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock

describe('verifyNumber handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('Verifies the code for a valid nonce and returns a security question key', async () => {
    jest.spyOn(codeService, 'generateNonce').mockReturnValue('12345')
    fetch.mockResponse(
      JSON.stringify({
        userId: '1',
        status: 'active',
        scope: ['demo'],
        mobile: '+8801711111111',
        securityQuestionKey: 'dummyKey'
      })
    )
    const stepOneRes = await server.server.inject({
      method: 'POST',
      url: '/verifyUser',
      payload: { mobile: '+8801711111111' }
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: stepOneRes.result.nonce, code: '000000' }
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload).nonce).toBe(stepOneRes.result.nonce)
    expect(JSON.parse(res.payload).securityQuestionKey).toBe('dummyKey')
  })
  it('throws error for an invalid nonce', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: 'invalid', code: '000000' }
    })
    expect(res.statusCode).toBe(401)
  })
  it('throws error for invalid retrieval status', async () => {
    jest
      .spyOn(retrievalService, 'getRetrievalStepInformation')
      .mockResolvedValueOnce({
        userId: '123',
        mobile: '+8801711111111',
        status: 'NUMBER_VERIFIED',
        securityQuestionKey: 'dummyKey'
      })
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: 'dummy', code: '000000' }
    })
    expect(res.statusCode).toBe(401)
  })
})
