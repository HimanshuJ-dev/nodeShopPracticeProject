const crypto = require('crypto');

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
// const mailchimp = require('mailchimp-api')

// const mailchimpApiKey = 'f5151f34510c8b476e55b121b2f6940e-us21';

// // const client = new mailchimp.Mailchimp(mailchimpApiKey);

require("dotenv").config()
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const user = 'testuser4shop@gmail.com';
const clientId = '327739920811-g3r478qomk3ahl9rboc52hr980cah6t9.apps.googleusercontent.com';
const clientSecret = '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';
const pass = 'TEST@user123';
const appPass = 'zsfc jwea cvuw wldz';
const refreshToken = '1//04NC-spjEt3zWCgYIARAAGAQSNwF-L9IrqAPoBSNE_9rUckrV1zw6FQHGRp9FfUM_aoODNF-g72jf7EBJEiN1KPeMZtoDG8OpEs4';
const accessToken = 'ya29.a0AfB_byBhX483pBO7_pWwuT8aD7K4eOqCYMFb_0TnHCKHwKeHQQEfGohT-OT3y-58gRfmceNOt6qRJMXw3elALr1WpMdv9B6RqPFRR46xKlGdOLcilZ6Tg5bcflkVVTqClwFSpWzmy7bL_cqawESR-gXECfPgseL-0CJtaCgYKAYwSARMSFQGOcNnCnCwY2wLJbClzsG0gA7wlmA0171';

// const createTransporter = async () => {
//   try {
//     const oauth2Client = new OAuth2(
//       process.env.clientId,
//       process.env.clientSecret,
//       "https://developers.google.com/oauthplayground"
//     );

//     oauth2Client.setCredentials({
//       refresh_token: process.env.refreshToken,
//     });

//     const accessToken = await new Promise((resolve, reject) => {
//       oauth2Client.getAccessToken((err, token) => {
//         if (err) {
//           console.log("*ERR: ", err)
//           reject();
//         }
//         resolve(token);
//       });
//     });

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.user,
//         accessToken: accessToken,
//         clientId: process.env.clientId,
//         clientSecret: process.env.clientSecret,
//         refreshToken: process.env.refreshToken,
//       },
//     });
//     return transporter;
//   } catch (err) {
//     return err
//   }
// };
// nodemailer.createTransport('smtps://testuser4shop@gmail.com:TEST@user123@smtp.gmail.com');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: user,
    pass: appPass,
  },
});
// var transporter = nodemailer.createTransport(smtpConfig);

// const sendMail = async () => {
//   try {
//     const mailOptions = {
//       from: process.env.user,
//       to: req.body.email,
//       subject: "Test",
//       text: "Hi, this is a test email",
//     }

//     let emailTransporter = await createTransporter();
//     await emailTransporter.sendMail(mailOptions);
//   } catch (err) {
//     console.log("ERROR: ", err)
//   }
// };





// const mailOptions = {
//   from: 'Himanshu <himanshu.rkj3@gmail.com>',
//   to: 'killersx',
//   subject: 'success',
//   text: 'success sent'
// };

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: errors.array()
      });
  }
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        return res.status(422)
          .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422)
            .render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMessage: 'Invalid email or password.',
              oldInput: {
                email: email,
                password: password
              },
              validationErrors: []
            });
        })
        .catch(err => {
          res.redirect('/login');
        })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
      });
  }
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      })
      return user.save();
    }).then(result => {
      res.redirect('/login');
      const mailOptions = {
        from: user,
        to: req.body.email,
        subject: "Test",
        text: "Hi, this is a test email",
      }
      return transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('success');
        }
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        const mailOptions = {
          from: user,
          to: req.body.email,
          subject: "Test",
          html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `
        }
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log('success');
          }
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);
      });
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        passwordToken: token,
        userId: user._id.toString()
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
  
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    }).then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    }).then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
}