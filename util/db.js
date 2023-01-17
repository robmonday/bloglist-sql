const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')

const sequelize = new Sequelize(DATABASE_URL)

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
  } catch (err) {
    console.log('failed to connect to the database')
  }
}

module.exports = { connectToDatabase, sequelize }
