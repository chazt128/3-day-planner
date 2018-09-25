const User = require('../../models/User');
const UserSession = require('../../models/UserSession');

module.exports = (app) => {
   // Sign up
   app.post('/api/account/signup', (req, res, next) => {
     const { body } = req;
     const { password } = body;
     let { email } = body;

     // If no email is entered
     if (!email) {
       return res.send({
         success: false,
         message: 'Error: Email cannot be blank.'
       });
     }
     // If no password is entered
     if (!password) {
       return res.send({
         success: false,
         message: 'Error: Password cannot be blank.'
       });
     }

     email = email.toLowerCase();
     // Remove white spaces
     email = email.trim();

     // Verify email doesn't exist
     User.find({ email: email}, (err, previousUsers) => {
       if (err) {
         return res.send({
           success: false,
           message: 'Error: Account already exists.'
         });
       }

       // Save new user
       const newUser = new User();

       newUser.email = email;
       newUser.password = newUser.generateHash(password);
       newUser.save((err, user) => {
         if (err) {
           return res.send({
             success: false,
             message: 'Error: Server error.'
           });
         }
         return res.send({
           success: true,
           message: 'Signed up!'
         });
       });
     });
   });  // end of sign up

   // Sign in
   app.post('/api/account/signin', (req, res, next) => {
     const { body } = req;
     const { password } = body;
     let { email } = body;
     console.log(email);
     if (!email) {
       return res.send({
         success: false,
         message: 'Error: Email cannot be blank.'
       });
     }
     if (!password) {
       return res.send({
         success: false,
         message: 'Error: Password cannot be blank.'
       });
     }

     email = email.toLowerCase();
     email = email.trim();

     User.find({
       email: email
     }, (err, users) => {
       if (err) {
         console.log('err 2:', err);
         return res.send({
           success: false,
           message: 'Error: server error'
         });
       }
       if (users.length != 1) {
         return res.send({
           success: false,
           message: 'Error: Invalid'
         });
       }

       const user = users[0];
       if (!user.validPassword(password)) {
         return res.send({
           success: false,
           message: 'Error: Invalid'
         });
       }

       // Otherwise correct users
       const userSession = new UserSession();
       userSession.userId = user._id;
       userSession.save((err, doc) => {
         if (err) {
           console.log(err);
           return res.send({
             success: false,
             message: 'Error: server error'
           });
         }

         return res.send({
           success: true,
           message: 'Valid sign in',
           token: doc._id
         });
       });
     });
   });

   // Log out
   app.get('/api/account/logout', (req, res, next) => {
     // Get the token
     const { query } = req;
     const { token } = query;
     // ?token=test

     // Verify the token is one of a kind and it's not deleted
     UserSession.findOneAndUpdate({
       _id: token,
       isDeleted: false
     }, {
       $set: {
         isDeleted: true
       }
     }, null, (err, sessions) => {
       if (err) {
         console.log(err);
         return res.send({
           success: false,
           message: 'Error: Server error'
         });
       }

       return res.send({
         success: true,
         message: 'Good'
       });
     });
   });

   app.get('/api/account/verify', (req, res, next) => {
     // Get token
     const { query } = req;
     const { token } = query;
     // ?token=timestamp

     // Verify the token is one of a kind and it's not deleted

     UserSession.find({
       _id: token,
       isDeleted: false
     }, (err, sessions) => {
       if (err) {
         console.log(err);
         return res.send({
           success: false,
           message: 'Error: Server error'
         });
       }

       if (sessions.length != 1) {
         return res.send({
           success: false,
           message: 'Error: Invalid'
         });
       } else {
         // DO ACTION
         return res.send({
           success: true,
           message: 'Good'
         });
       }
     });
   });
};
