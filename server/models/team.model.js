const mongoose = require('../config/database')

const teamSchema = mongoose.Schema({
  round: {
    type: mongoose.Schema.ObjectId,
    ref: 'round',
    required: [true, 'Round id is required!'],
  },
  season: {
    type: mongoose.Schema.ObjectId,
    ref: 'season',
    required: [true, 'Season id is required!'],
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: [true, 'Team name is required'],
  },
  players: [{
    type: mongoose.Schema.ObjectId,
    ref: 'player',
  }],
  avatar: {
    type: mongoose.Schema.ObjectId,
    ref: 'media',
  },
  groupPhoto: {
    type: mongoose.Schema.ObjectId,
    ref: 'media',
  },
  goalScored: {
    type: Number,
    default: 0,
  },
  goalTaken: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  losts: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
})

//  TEAM NAME ARE UNIQUE PER SEASON
teamSchema.index({ name: 1, season: 1 }, { unique: true })

teamSchema.post('remove', (team, done) => {
  const promises = []
  team
  .model('player')
  .find({ team: team._id })
  .then((players) => {
    for (let i = 0; i < players.length; i++) {
      promises.push(players[i].remove())
    }
    return team.model('media').find({ _id: { $in: [team.groupPhoto, team.avatar] } })
  })
  .then((medias) => {
    for (let i = 0; i < medias.length; i++) {
      promises.push(medias[i].remove())
    }
    return Promise.all(promises)
  })
  .then(done())
  .catch(done)
})


/**
 * Instance Methods
 */

/**
 * teamStatsUpdate
 * @param  {[Bollean]} returnNewDocument if updating only or findandUpdate returning the new Document
 * @return {[type]}                   [description]
 */
teamSchema.methods.teamUpdateStats = function teamUpdateStats(returnNewDocument) {
  const team = this
  const Team = mongoose.model('team')
  const Match = mongoose.model('match')
  const Score = mongoose.model('score')
  return Promise.all([
    Match.count({ winner: team._id, played: true }),
    Match.count({ loser: team._id, played: true }),
    Match.count({ $or: [{ teamHome: team._id }, { teamAway: team._id }], played: true, winner: null, loser: null }),
    Score.count({ teamScorer: team._id }),
    Score.count({ teamTaker: team._id }),
  ])
  .spread((wins, losts, draws, goalScored, goalTaken) => {
    const updates = {
      $set: {
        wins,
        losts,
        draws,
        goalScored,
        goalTaken,
        points: (wins * 3) + draws,
      },
    }
    if (returnNewDocument) {
      return Team.findAndUpdate({ _id: team._id }, updates, { new: true })
    }
    return Team.update({ _id: team._id }, updates)
  })
  .catch((err) => {
    console.error(err)
  })
}

module.exports = mongoose.model('team', teamSchema, 'teams')
