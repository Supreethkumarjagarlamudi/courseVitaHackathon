import express from 'express'
import dotenv from 'dotenv'

const app = express();

dotenv.config({quiet: true})

app.listen(process.env.PORT, () => {
    console.log(`Server running at PORT: ${process.env.PORT}`);
})