/*
Exemplo baseado no vídeo:
https://www.youtube.com/watch?v=PgAO4YhOsKw
*/

var express = require('express'),
    bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	app = express(),
	mongoose = require('mongoose');
	
	//senha do JWT 
	const JWT_PASSWORD = 'senha';
	
	mongoose.connect('mongodb://127.0.0.1/trabalho');

	//estrutura do usuario
	var usuarioSchema = mongoose.Schema({
		usuario: String,
		senha: String
	});
	Usuario = mongoose.model('Usuario', usuarioSchema);
	
	//estrutura das mensagens	
	var MensagemSchema = mongoose.Schema({
		usuarioPostou: String,
		msg: String
	});
	Mensagem = mongoose.model('Mensagem', MensagemSchema);
/*
	//cria usuario
	var data  = new Usuario({
		usuario: 'felipe',
		senha: 'senha'
	});
	data.save(function(err) {
		if (err)
			res.send(err);
		console.log(data);
	});
*/

app.post( '/login', bodyParser.json(), function(req, res){
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username == '' || password == '') {
		return res.status(401).json({ error: 'Usuário ou senha inválido.'});
	}
	Usuario.findOne({usuario: username}, function (err, user) {
		if (err || (user == null)  || (user.senha == null) || (password !== user.senha)) {
			return res.status(401).json({ error: 'Usuário ou senha não encontrado.'});
		}else{
			res.json({token: jwt.sign({username: user.usuario}, JWT_PASSWORD, { expiresIn: '20h' })});
		}
	});
});

app.post( '/msg', bodyParser.json(), function(req, res){
	var auth = req.headers.authorization;

	if(!auth || !auth.startsWith('tkn')){
		return res.status(401).json({ error:'JWT Token Missing.'});
	}else {
		auth = auth.split('tkn').pop().trim();
	}
	
	jwt.verify(auth, JWT_PASSWORD, function(err, data){
		if(err)
		{
			return res.status(401).json({ error: 'Not Authorized'});	
		}else
		{
			var mens = new Mensagem({
				usuarioPostou: data.username,
				msg: req.body.msg
			});
			mens.save();
			
			return res.status(200).json({});
		}
	});
});

app.get('/msg', function(req, res){
	var auth = req.headers.authorization;

	if(!auth || !auth.startsWith('tkn')){
		return res.status(401).json({ error:'JWT Token Missing.'});
	}else {
		auth = auth.split('tkn').pop().trim();
	}
	jwt.verify(auth, JWT_PASSWORD, function(err, data){
		if(err)
		{
			return res.status(401).json({ error: 'Not Authorized'});	
		}else
		{
			Mensagem.find({}, function (err, msgs) {
				if (err) {
					return res.status(401).json({ error: 'Erro ao consultar mensagens.'});
				}else{
					return res.send(msgs);
				}
			});
		}
	});
});

app.listen(8090);
console.log("rodando na 8090\n");