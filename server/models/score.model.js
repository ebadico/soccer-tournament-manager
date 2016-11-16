const mongoose = require('../config/database')

const scoreSchema = mongoose.Schema({
  season: {
    type: mongoose.Schema.ObjectId,
    ref: 'season',
    required: [true, 'Season id required'],
  },
  match: {
    type: mongoose.Schema.ObjectId,
    ref: 'match',
    required: [true, 'Match id required'],
  },
  teamScorer: {
    type: mongoose.Schema.ObjectId,
    ref: 'team',
    required: [true, 'Team scorer id required'],
  },
  teamTaker: {
    type: mongoose.Schema.ObjectId,
    ref: 'team',
    required: [true, 'Team taker id required'],
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'player',
    required: [true, 'Player id required'],
  },
})

scoreSchema.pre('validate', function matchPreValidation(next) {
  const match = this;
  if (match.isModified('teamScorer') || match.isModified('teamTaker')) {
    if (match.teamScorer && match.teamTaker) {
      if (match.teamScorer.equals(match.teamTaker)) {
        const err = new Error('score.model validation: teamScorer and teamTaker ids must be different!')
        next(err)
      }
    }
  }
  next()
})

scoreSchema.post('save', (doc) => {
  const Player = mongoose.model('player')
  const Score = mongoose.model('score')
  return Score.count({ player: doc.player })
  .then((goals) => {
    return Player.update({ _id: doc.player }, { $set: { goals } })
  })
})

scoreSchema.post('remove', (doc) => {
  const Player = mongoose.model('player')
  const Score = mongoose.model('score')
  return Score.count({ player: doc.player })
  .then((goals) => {
    return Player.update({ _id: doc.player }, { $set: { goals } })
  })
})

module.exports = mongoose.model('score', scoreSchema, 'scores')
