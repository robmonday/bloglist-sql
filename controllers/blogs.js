const router = require('express').Router()
require('express-async-errors')

const { Blog } = require('../models')

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
  } catch (err) {
    next(err)
  }
  next()
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
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

router.post('/', async (req, res) => {
  console.log(req.body)
  try {
    const blog = await Blog.create(req.body)
    return res.json(blog)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router
