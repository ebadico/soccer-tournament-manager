const mongoose = require('../config/database')

const expulsionSchema = mongoose.Schema({
  match: {
    type: mongoose.Schema.ObjectId,
    ref: 'match',
    required: [true, 'Match ID is required'],
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'team',
    required: [true, 'team ID is required'],
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'player',
    required: [true, 'player ID is required'],
  },
})


expulsionSchema.post('save', (doc) => {
  const Player = mongoose.model('player')
  const Expulsion = mongoose.model('expulsion')
  return Expulsion.count({ player: doc.player })
  .then((expulsions) => {
    return Player.update({ _id: doc.player }, { $set: { expulsions } })
  })
})

expulsionSchema.post('remove', (doc) => {
  const Player = mongoose.model('player')
  const Expulsion = mongoose.model('expulsion')
  return Expulsion.count({ player: doc.player })
  .then((expulsions) => {
    return Player.update({ _id: doc.player }, { $set: { expulsions } })
  })
})

module.exports = mongoose.model('expulsion', expulsionSchema, 'expulsions')
