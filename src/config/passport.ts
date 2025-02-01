import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as userServices from '../services/user.services';
import { AuthType } from '../enums/AuthType';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/be/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await userServices.findUserByEmail(
          profile.emails![0].value
        );

        if (!user) {
          const newUser = await userServices.createUser({
            auth_type: AuthType.GOOGLE,
            googleId: profile.id,
            email: profile.emails![0].value,
            name: profile.displayName,
            avatar_url: profile.photos ? profile.photos[0].value : '',
          });

          return done(null, newUser);
        }

        return done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userServices.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
