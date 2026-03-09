require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { authRouter } = require("./routes/auth.rotues")
const mongoose = require("mongoose")

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use("/api", authRouter)

const PORT = process.env.PORT
const mongo_url = process.env.mongo_url

app.listen(PORT, () => {
  console.log("server is running on", PORT)
})

mongoose.connect(mongo_url)
  .then(() => console.log("successfully connected to db"))
  .catch((err) => console.log("failed to connect to db", err.message))