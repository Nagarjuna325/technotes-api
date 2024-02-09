require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
//const rootRoutes = require('./routes/root')
const {logger} = require('./middleware/logger')

const errorHandler = require('./middleware/errorHandler')

const cookieParser = require('cookie-parser')

const cors = require('cors')

const connectDB = require('./config/dbConn')

const mongoose = require('mongoose')

const {logEvents} = require('./middleware/logger')

const corsOptions = require('./config/corsOptions')
const PORT =  process.env.PORT ||3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

// app.use(cors(corsOptions))
app.use(cors({
    origin: "*",
}))

//app.use(cors())
   
app.use(express.json()) // built in middleware

app.use(cookieParser()) // 3rd party middle ware

app.use('/', express.static(path.join(__dirname,'public'))) // one builtin middleware already present

app.use('/', require('./routes/root'))

app.use('/auth',require('./routes/authRoutes'))
app.use('/users',require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req , res) => {
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }else if(req.accepts('json')){
        res.json({message: '404 Not Found'})
    } else{
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open',()=>{
    console.log('Connected to MongoDB')
    app.listen(PORT , ()=> console.log('Server running on port ${PORT}'))
})

mongoose.connection.on('error', err=>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
//app.listen(PORT , ()=> console.log('Server running on port ${PORT}'))

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
