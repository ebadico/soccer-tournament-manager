const { Promise } = global
const mongoose = require('../config/database')

const daySchema = mongoose.Schema({
  round: { type: mongoose.Schema.ObjectId, ref: 'round', required: [true, 'No round ID provided'] },
  season: { type: mongoose.Schema.ObjectId, ref: 'season', required: [true, 'No season ID provided'] },
  lastday: { type: Boolean, default: false },
})

/**
 * MODEL METHOD - Update lastday attribute per round
 * @return Promise
 */
daySchema.statics.setLastDay = function roundSetLastDay(dayId) {
  const Day = this
  return new Promise((resolve, reject) => {
    return Day.findOneAndUpdate({ _id: dayId }, {
      $set: {
        lastday: true,
      },
    }, { new: true }, (updateDayError, updatedDay) => {
      if (updateDayError) return reject(updateDayError)
      return Day.update({
        round: updatedDay.round,
        _id: { $ne: updatedDay._id },
      }, {
        $set: {
          lastday: false,
        },
      }, {
        multi: true,
      }, (updateBulkError) => {
        if (updateBulkError) return reject(updateBulkError)
        return resolve(updatedDay)
      })
    })
  })
}

/**
 * Cascade remove matches of this day
 * @return Promise
 */
daySchema.methods.cascadeRemove = function dayCascadeRemoveData() {
  const day = this
  const match = this.model('match')
  return match.find({ day: day._id }).exec()
  .then((matches) => {
    // Cascade remove matches data
    const promises = []
    matches.forEach((match) => {
      promises.push(match.cascadeRemove())
    })
    return Promise.all(promises)
  })
  .then((matches) => {
    // Remove matches
    const promises = []
    matches.forEach((match) => {
      promises.push(match.remove())
    })
    return Promise.all(promises)
  })
  .then(() => {
    return day.remove()
  })
}

daySchema.methods.addInfo = function addDayInfo() {
  let day = this
  const match = this.model('match')
  return Promise.all([
    match.count({ day: day._id }).exec(),
    match.count({ day: day._id, played: true }).exec(),
  ])
  .then((res) => {
    day = day.toObject()
    day.matchesCount = res[0]
    day.playedMatches = res[1]
    day.notPlayedMatches = day.matchesCount - day.playedMatches
    return Promise.resolve(day)
  })
}

module.exports = mongoose.model('day', daySchema, 'days')
