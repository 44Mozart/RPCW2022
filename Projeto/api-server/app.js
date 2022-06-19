var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken')

var indexRouter = require('./routes/index');

var app = express();

var mongoose = require('mongoose');

//Conexão ao MongoDB
var mongoDB = 'mongodb://127.0.0.1/RPCWProjeto'
mongoose.connect(mongoDB,  {useNewUrlParser: true}, {useUnifiedTopology :true})
var db = mongoose.connection;
db.on('error', console.error.bind(console,'Erro na conexão MongoDB'))
db.once('open', function(){
  console.log('Conexão ao mongoBD com sucesso')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Verifica se o pedido veio com o token de acesso
app.use(function(req, res, next){
  var myToken = req.query.token || req.body.token
  if(myToken){
    jwt.verify(myToken, "RPCW2022", function(e, payload){
      if(e){
        res.status(401).jsonp({error: e})
      }
      else{
          req.user = { level: payload.level, username: payload.username}
          next()
      } 
    })
  }
  else{
    res.status(401).jsonp({error: "Token inexistente!"})
  }
})

app.use('/api', indexRouter);

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
