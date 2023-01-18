const router = require('express').Router()
require('express-async-errors')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { Blog, User } = require('../models')

const { Op } = require('sequelize')

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
  } catch (err) {
    next(err)
  }
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  console.log('authorization', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      console.log('decodedToken', req.decodedToken)
      console.log('SECRET', SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        { title: { [Op.substring]: req.query.search } },
        { author: { [Op.substring]: req.query.search } },
      ],
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
    order: [['likes', 'DESC']],
  })
  // blogs.map((blog) => console.log(JSON.stringify(blog))) // log to console
  res.json(blogs)
})

router.get('/:id', blogFinder, async (req, res) => {
  console.log(req.blog)
  res.json(req.blog)
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  if (req.blog && req.decodedToken.id === req.blog.userId) {
    await req.blog.destroy()
    res.status(204).end()
  } else {
    res.status(401).json({ error: 'user not authorized to delete this record' })
  }
})

router.put('/:id/like', blogFinder, async (req, res) => {
  console.log(req.blog)
  if (req.blog) {
    req.blog.likes += 1
    await req.blog.save()
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({
      ...req.body,
      userId: user.id,
      // date: new Date(),
    })
    return res.json(blog)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router
