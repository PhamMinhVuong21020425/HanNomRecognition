import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import MySQLSession, { Options } from 'express-mysql-session';
import * as expressSession from 'express-session';
import passport from 'passport';
import './config/passport';

import indexRouter from './routes/index';

import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import NextRenderer from './config/next-render';
import { User } from './entities/user.entity';
import { THREE_HOURS } from './constants';

import * as dotenv from 'dotenv';
dotenv.config();

declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}

// establish database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: Error | unknown) => {
    console.error('Error during Data Source initialization:', err);
  });

// create and setup express app
const app = express();

// Passport config
app.use(passport.initialize());

const MySQLStore = MySQLSession(expressSession);

const options: Options = {
  connectionLimit: parseInt(process.env.CONNECTION_LIMIT || '10'),
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  createDatabaseTable: true,
};

const sessionStore = new MySQLStore(options);

// Cấu hình session trong Express
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'abcxyz',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      secure: false, // Đặt thành true nếu sử dụng HTTPS
      maxAge: THREE_HOURS, // 3h
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// routes
app.use('/be', indexRouter);

app.use(NextRenderer.handleRequests);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
