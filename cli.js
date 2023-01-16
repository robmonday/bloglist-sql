require('dotenv').config()
const axios = require('axios')

const baseUrl = `http://localhost:${process.env.PORT}`

axios.get(baseUrl + '/api/blogs').then((blogs) =>
  blogs.data.map((blog) => {
    console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
  })
)
