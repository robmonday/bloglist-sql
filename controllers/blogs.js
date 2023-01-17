const router = require('express').Router()
require('express-async-errors')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { Blog, User } = require('../models')

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
  console.log(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      // console.log('decodedToken', req.decodedToken)
      // console.log('SECRET', SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    include: {
      model: User,
      attributes: ['name'],
    },
  })
  res.json(blogs)
})

router.get('/:id', blogFinder, async (req, res) => {
  console.log(req.blog)
  res.json(req.blog)
})

router.delete('/:id', async (req, res) => {
  const count = await Blog.destroy({ where: { id: req.params.id } })
  console.log(`deleted row(s): ${count}`)
  res.status(204).end()
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
