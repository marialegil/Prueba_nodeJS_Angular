var express=require("express");
var app=express();
var body_parser=require("body-parser")
var model=require("./model");

app.set('port', (process.env.PORT || 3000))


app.use(express.static(__dirname + '/public'));

app.use(express.static('public'));
app.use(express.static('assets'));
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}));

app.get("/",function(req,res){
res.sendFile(__dirname+'/public/layouts.html');
});

app.get("/prueba",function(req,res){


});

app.get("/nombres",function(req,res,next){
model.usuarios(req, res, next);

});


app.post("/relatorio",function(req,res,next){
model.boton_relatorio(req, res, next);
});



app.listen(app.get('port'),function(){
  console.log('listening in port '+app.get('port'));
});



//app.listen(4000);



/**/

