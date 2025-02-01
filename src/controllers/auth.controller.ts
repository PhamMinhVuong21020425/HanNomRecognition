import pug from 'pug';
import path from 'path';
import sendEmail, { mailOptionsTemplate } from '../config/nodemailer-config';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../entities/user.entity';
import {
  findUserByEmail,
  saveUser,
  authenticateUser,
} from '../services/auth.services';
import { UserRole } from '../enums/UserRole';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthType } from '../enums/AuthType';
import { EXPIRED_TIME } from '../constants';

export const getAuthInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.user) {
      const user = req.session.user;
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
        about: user.about,
        birthday: user.birthday,
        avatar_url: user.avatar_url,
      };
      res.json({ user: userData });
    } else {
      res.json({ user: null });
    }
  }
);

export const registerPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Chuyển đổi body thành đối tượng RegisterDTO
    const dto = plainToClass(RegisterDTO, req.body);

    // Xác thực dữ liệu DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.json({
        errors: errors.map(err => ({
          param: err.property,
          msg: Object.values(err.constraints || {})[0],
        })),
      });
      return;
    }

    // Kiểm tra xem người dùng đã tồn tại chưa
    const userExists = await findUserByEmail(dto.email);
    if (userExists) {
      res.json({
        error_msg: 'error.user_exists',
      });
      return;
    }

    // Tạo đối tượng User mới
    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    user.hash_password = await user.hashPassword(dto.password, AuthType.LOCAL);
    user.gender = dto.gender;
    user.phone = dto.phone;

    if (dto.role === UserRole.ADMIN) {
      user.role = UserRole.ADMIN;
    } else {
      user.role = UserRole.USER;
    }

    // Lưu người dùng vào cơ sở dữ liệu
    await saveUser(user);

    // Gửi mã xác thực đến email
    return res.redirect(`/be/auth/verify/${encodeURIComponent(user.email)}`);
  }
);

export const verifyGet = asyncHandler(async (req: Request, res: Response) => {
  const email = req.params.email;

  const user = await findUserByEmail(email);
  if (!user) {
    res.json({ error_msg: 'error.userNotFound' });
    return;
  }

  // Send authentication code to email
  const authCode = user.generateAuthCode();
  user.authCode = authCode;
  user.authCodeExpires = new Date(Date.now() + EXPIRED_TIME);
  user.isVerify = false;

  await saveUser(user);

  const htmlContent = pug.renderFile(
    path.join(__dirname, '../views/emails/authenticate.pug'),
    {
      authCode,
    }
  );

  const mailOptions = {
    ...mailOptionsTemplate,
    to: [user.email],
    subject: '[Han Nom Recognition] Account Authentication Code',
    html: htmlContent,
  };

  sendEmail(mailOptions);

  res.json({ status: 'verify' });
});

export const verifyPost = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    res.json({ error_msg: 'error.userNotFound' });
    return;
  }

  if (user.authCode !== code || user.authCodeExpires < new Date()) {
    res.json({ error_msg: 'error.invalidCode' });
    return;
  }

  // Code is valid, active the user
  user.authCode = '';
  user.authCodeExpires = new Date();
  user.isVerify = true;
  await saveUser(user);

  req.session.user = user;

  res.json({ status: 'success' });
});

export const loginPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(LoginDTO, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const formattedErrors = errors.map(err => ({
        param: err.property,
        msg: Object.values(err.constraints || {})[0],
      }));

      res.json({
        errors: formattedErrors,
      });
      return;
    }

    const user = await authenticateUser(dto.email, dto.password);

    if (user) {
      if (!user.isActivate) {
        res.json({ error_msg: 'error.userNotActivated' });
        return;
      }

      if (!user.isVerify) {
        res.json({ status: 'verify' });
        return;
      }

      // Lưu thông tin người dùng vào session
      req.session.user = user;

      res.json({ status: 'success' });
    } else {
      res.json({ error_msg: 'error.invalidCredentials' });
    }
  }
);

export const logout = asyncHandler(
  (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.redirect('/auth/login?error=error.authFailed');
      return;
    }

    const user = req.user as User;

    if (!user.isActivate) {
      res.redirect('/auth/login?error=error.userNotActivated');
      return;
    }

    req.session.user = user;
    res.redirect('/');
  }
);

export const forgotPassPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      res.json({ error_msg: 'error.userNotFound' });
      return;
    }

    // Send authentication code to email
    const authCode = user.generateAuthCode();
    user.authCode = authCode;
    user.authCodeExpires = new Date(Date.now() + EXPIRED_TIME);

    await saveUser(user);

    const htmlContent = pug.renderFile(
      path.join(__dirname, '../views/emails/reset-password.pug'),
      {
        authCode,
      }
    );

    const mailOptions = {
      ...mailOptionsTemplate,
      to: [user.email],
      subject: '[Han Nom Recognition] Reset Password',
      html: htmlContent,
    };

    sendEmail(mailOptions);

    res.json({ status: 'success' });
  }
);
