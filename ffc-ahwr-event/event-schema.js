const joi = require('joi')

const eventSchema = joi.object({
  name: joi.string().required(),
  properties: joi.object({
    id: joi.string().required(),
    checkpoint: joi.string().required(),
    status: joi.string().required(),
    action: joi.object({
      type: joi.string().required(),
      message: joi.string().required(),
      data: joi.object(),
      raisedOn: joi.date().required(),
      raisedBy: joi.string().required()
    }).required()
  })
})

const validateEvent = (event) => {
  const validate = eventSchema.validate(event)

  if (validate.error) {
    console.log('Event validation error', validate.error)
    return false
  }

  return true
}

module.exports = { validateEvent }
