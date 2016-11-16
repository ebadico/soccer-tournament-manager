const mongoose = require('../config/database')

const warnSchema = mongoose.Schema({
  match: {
    type: mongoose.Schema.ObjectId,
    ref: 'match',
    required: [true, 'Match ID is required'],
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'team',
    required: [true, 'Team ID is required'],
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'player',
    required: [true, 'Player ID is required'],
  },
})

warnSchema.post('save', (doc) => {
  const Player = mongoose.model('player')
  const Warn = mongoose.model('warn')
  return Warn.count({ player: doc.player })
  .then((warns) => {
    return Player.update({ _id: doc.player }, { $set: { warns } })
  })
})

warnSchema.post('remove', (doc) => {
  const Player = mongoose.model('player')
  const Warn = mongoose.model('warn')
  return Warn.count({ player: doc.player })
  .then((warns) => {
    return Player.update({ _id: doc.player }, { $set: { warns } })
  })
})

module.exports = mongoose.model('warn', warnSchema, 'warns')
