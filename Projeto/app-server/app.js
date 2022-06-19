var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var LocalStrategy = require('passport-local').Strategy
var passport = require('passport');
var { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const FileStore = require('session-file-store')(session);
var axios = require('axios')


var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



passport.use(new LocalStrategy(
  {usernameField: 'username'}, (username, password, done) => {
    axios.get('http://localhost:3003/users/username/' + username)
      .then(dados => {
        const user = dados.data
        if(!user) {  return done(null, false, {message: 'Utilizador inexistente!\n'})}
        if(password != user.password) { return done(null, false, {message: 'Credenciais inválidas!\n'})}
        return done(null, user)
      })
      .catch(e => done(e))
    })
)


// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user,done) => {
  console.log('Serielização, uname: ' + user.username)
  done(null, user.username)
})

// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((uname, done) => {
  console.log('Desserielização, username: ' + uname)
  axios.get('http://localhost:3003/users/username/' + uname)
    .then(dados => {console.log('Deserialize: ' + JSON.stringify(dados.data)); done(null, dados.data)})
    .catch(erro => done(erro, false))
})




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('O meu segredo'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  genid: req => {
    console.log("Dentro do middleware da sessão...")
    console.log(req.sessionID)
    return uuidv4()
  },
  secret: 'O meu segredo',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
// Depois de configurar as sessões
app.use(passport.initialize());
app.use(passport.session());
// Antes dos roteadores

app.use('/', indexRouter);
app.use('/user', userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
