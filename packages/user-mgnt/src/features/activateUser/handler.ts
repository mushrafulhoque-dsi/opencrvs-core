import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateSaltedHash, generateHash } from '@user-mgnt/utils/hash'
import { logger } from '@user-mgnt/logger'
import { statuses } from '@user-mgnt/utils/userUtils'

interface ISecurityQNA {
  questionKey: string
  answer: string
}

interface IActivateUserPayload {
  userId: string
  password: string
  securityQNAs: [ISecurityQNA]
}

export default async function activateUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userUpdateData = request.payload as IActivateUserPayload

  // tslint:disable-next-line
  const user: IUserModel | null = await User.findById(userUpdateData.userId)
  if (!user) {
    logger.error(
      `No user details found by given userid: ${userUpdateData.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }
  if (user.status !== statuses.PENDING) {
    logger.error(
      `User is not in pending state for given userid: ${userUpdateData.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const { hash, salt } = generateSaltedHash(userUpdateData.password)
  user.salt = salt
  user.passwordHash = hash
  user.status = statuses.ACTIVE
  user.securityQuestionAnswers = userUpdateData.securityQNAs.map(
    securityQNA => {
      return {
        questionKey: securityQNA.questionKey,
        answerHash: generateHash(securityQNA.answer.toLowerCase(), salt)
      }
    }
  )

  try {
    // tslint:disable-next-line
    await User.update({ _id: user._id }, user)
  } catch (err) {
    logger.error(err.message)
    // return 400 if there is a validation error when updating to mongo
    return h.response().code(400)
  }

  return h.response().code(201)
}
const securityQNASchema = Joi.object({
  questionKey: Joi.string().required(),
  answer: Joi.string().required()
})

export const requestSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().required(),
  securityQNAs: Joi.array()
    .items(securityQNASchema)
    .required()
})
