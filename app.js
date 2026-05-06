import express from "express";
import cookieParser from "cookie-parser";
import userRouter from './src/router/user.router.js'
import adminRouter from './src/router/admin.router.js'
import doctorRouter from './src/router/doctor.router.js'

import cors from 'cors';




const app = express();

app.use(cors({
    origin: process.env.CROS_ORIGEN,
    credentials:true
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());


app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);




export { app }