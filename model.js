	var pgp = require("pg-promise");
	var moment = require("moment");
	var knex = require('knex')({
  		client: 'pg',
  		connection: {
    		host : 'ec2-54-221-220-59.compute-1.amazonaws.com',
    		user : 'alhbydtjqcrlto',
   			password : 'cbd3d94c6582119ac343e9644c7723fe669a84653052fe0f7d18b524374daea2',
    		database : 'd4ghjsmabddf5b'
  		}
	});


	function usuarios(req, res,next){
		knex.select('cao_usuario.no_usuario', 'cao_usuario.co_usuario')
		.from('cao_usuario')
		.innerJoin('permissao_sistema', 'cao_usuario.co_usuario', '=' ,'permissao_sistema.co_usuario')
		.where('permissao_sistema.co_sistema', '1')
		.where('in_ativo', 'S')
		.whereIn('co_tipo_usuario', [0,1,2])
    	.then(function (data) {
        res.send(data);
    })
    .catch(function (error) {
        console.log("ERROR", error);
    });


	};

	function boton_relatorio(req,res,next){
		var fecha_desde=moment().month(req.body.desde_mes).year(req.body.desde_ano).startOf('month').format('YYYY-MM-DD')
		var fecha_hasta=moment().month(req.body.hasta_mes).year(req.body.hasta_ano).endOf('month').format('YYYY-MM-DD')

		console.log(fecha_desde, fecha_hasta);

		var receita_liquida=knex.raw('sum ( cao_fatura.valor - (cao_fatura.valor * (cao_fatura.total_imp_inc / 100)) )');
		var comissao=knex.raw('SUM( (cao_fatura.valor - (cao_fatura.valor * (cao_fatura.total_imp_inc / 100))) * (cao_fatura.comissao_cn / 100) )');
		var lucro =knex.raw('? - (cao_salario.brut_salario + ?)',[receita_liquida,comissao]);
		var year=knex.raw('extract(year from cao_fatura.data_emissao) as year');
		var mes=knex.raw('extract(month from cao_fatura.data_emissao) as mes');
		

		var e=knex.select('cao_usuario.no_usuario','cao_salario.brut_salario',year,mes,{
					receita_liquida:receita_liquida,
					comissao:comissao,
					lucro:lucro,
					custo_fixo:'cao_salario.brut_salario'
				})
		.from('cao_fatura')
		.innerJoin('cao_usuario',function(){
			this.onIn('cao_usuario.co_usuario',req.body.consultoresSelec)
		})
		.innerJoin('cao_os', function(){
			this.on('cao_fatura.co_os','=','cao_os.co_os')
			this.on('cao_os.co_usuario','cao_usuario.co_usuario')
			this.onBetween('cao_fatura.data_emissao',[fecha_desde,fecha_hasta])
		})
		.innerJoin('cao_salario', 'cao_usuario.co_usuario','=','cao_salario.co_usuario')
		.groupBy('cao_usuario.no_usuario', 'cao_os.co_usuario','cao_salario.brut_salario', 'year','mes')
		.orderBy('year');

		var tot=knex.select('a.no_usuario', {
	 		tot_rec_liq:knex.raw('sum (a.receita_liquida)'),
	 		tot_comissao:knex.raw('sum (a.comissao)'),
	 		tot_lucro:knex.raw('sum (a.lucro)'),
	 		tot_custo_fixo:knex.raw('sum (a.custo_fixo)')
	 	}).from(knex.raw('? as a',[e])).groupBy('a.no_usuario');

	 	Promise.all([e,tot])


    	.then(function (data) {
       		console.log("DATA", data);
      		res.send(data);
   		 })
    	.catch(function (error) {
        	console.log("ERROR", error);
    	});
	};


	module.exports.boton_relatorio=boton_relatorio;
	module.exports.usuarios=usuarios;


	




