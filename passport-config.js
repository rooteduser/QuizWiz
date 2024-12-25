const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) => {
    try {const user = await getUserByEmail(email)  //rewrote the function for the new async getUserByEmail
        if(user == null){
            return done(null, false, { message: 'No user with that email'})
        }
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else{
                return done(null, false, { message: 'Password incorrect'})
            }        
        }   catch(e) {  
            return done(e)
        }
    }  
    passport.use(new LocalStrategy( {usernameField: 'email'},
    authenticateUser))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = await getUserById(id)
        done(null,user)
    })
}

module.exports = initialize