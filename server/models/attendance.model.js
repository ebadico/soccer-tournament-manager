const mongoose = require('../config/database')

const attendanceSchema = mongoose.Schema({
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
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'player',
    required: [true, 'Player id required'],
  },
})

attendanceSchema.post('save', (doc) => {
  const Player = mongoose.model('player')
  const Attendance = mongoose.model('attendance')
  return Attendance.count({ player: doc.player })
  .then((attendance) => {
    return Player.update({ _id: doc.player }, { $set: { attendance } })
  })
})

attendanceSchema.post('remove', (doc) => {
  const Player = mongoose.model('player')
  const Attendance = mongoose.model('attendance')
  return Attendance.count({ player: doc.player })
  .then((attendance) => {
    return Player.update({ _id: doc.player }, { $set: { attendance } })
  })
})

module.exports = mongoose.model('attendance', attendanceSchema, 'attendances')
