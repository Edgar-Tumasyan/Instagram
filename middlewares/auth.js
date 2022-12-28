const passport = require('koa-passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { User, Admin } = require('../data/models');
const config = require('../config');

const jwtOptions = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.JWT_SECRET };

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user =
                payload.role === 'user'
                    ? await User.findByPk(payload.id, { raw: true })
                    : await Admin.findByPk(payload.id, { raw: true });

            if (!user) {
                return done(null, null);
            }

            user.tokenType = payload.role;

            done(null, user);
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    })
);

module.exports = passport.authenticate('jwt', { session: false });
