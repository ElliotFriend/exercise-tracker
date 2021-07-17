const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { Schema } = mongoose
const bodyParser = require('body-parser')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
})
let User = mongoose.model('User', userSchema)

const logSchema = new Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
})
let ExerciseLog = mongoose.model('ExerciseLog', logSchema)

const createUser = async (username, done) => {
  let user = new User({
    username: username
  })
  user.save((err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const getUserInfo = async (userId, done) => {
  User.findById(userId, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const getAllUsers = async (done) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const createExerciseLog = async (newExerciseLog, done) => {
  let newLog = new ExerciseLog(newExerciseLog)
  newLog.save((err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .post(async (req, res) => {
    let username = req.body.username
    let doc = await createUser(username, (err, data) => {
      if (err) return console.log(err)
      res.json({ username: data.username, _id: data._id })
    })
  })
  .get(async (req, res) => {
    let allUsers = await getAllUsers((err, data) => {
      if (err) return console.log(err)
      res.json(data)
    })
  })

app.post('/api/users/:_id/exercises', async (req, res) => {
  let userId = req.params._id
  let newExerciseLog = {
    user: userId,
    description: req.body.description,
    duration: req.body.duration,
  }
  if (req.body.date) newExerciseLog.date = req.body.date

  let userDoc = getUserInfo(userId, async (userErr, userDoc) => {
    if (userErr) return console.log(userErr)
    let logDoc = await createExerciseLog(newExerciseLog, (logErr, logDoc) => {
      if (logErr) return console.log(logErr)
      res.json({
        _id: userDoc._id,
        username: userDoc.username,
        date: logDoc.date,
        duration: logDoc.duration,
        description: logDoc.description,
      })
    })
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
