angular
	.module("MyfirstApp",[])
	.controller("FirstController", FirstController);

function FirstController($scope,$http){
 $scope.dataConsultores = [];
    $scope.anoinicio = 2007;
    $scope.anofin = 2007;
    $scope.mesinicio = '01';
    $scope.mesfin = '12';
    $scope.meses = [
      { id: '00', name: 'Enero' },
      { id: '01', name: 'Febrero' },
      { id: '02', name: 'Marzo' },
      { id: '03', name: 'Abril' },
      { id: '04', name: 'Mayo' },
      { id: '05', name: 'Junio' },
      { id: '06', name: 'Julio' },
      { id: '07', name: 'Agosto' },
      { id: '08', name: 'Septiembre' },
      { id: '09', name: 'Octubre' },
      { id: '10', name: 'Noviembre' },
      { id: '11', name: 'Diciembre' }
    ];
    $scope.anos = [2003, 2004, 2005, 2006, 2007];

	$scope.consultoresSelec=[];
	//$scope.relatorio=false;
	$scope.nom_meses={

			1: 'Ene',
			2: 'Feb',
			3: 'Mar',
			4: 'Abr',
			5: 'May',
			6: 'Jun',
			7: 'Jul',
			8: 'Ago',
			9: 'Sep',
			10: 'Oct',
			11: 'Nov',
			12: 'Dic',
	};
$scope.custo_fixo_p={
			type:'line',
			label:'Custo Fijo Promedio',
			data:[]
		};

	$http({
		method: 'GET',
		url: '/nombres'
	})
	.then(

	function successCallback(response){
		$scope.consultores=response.data;
	},
	 function errorCallback(error){
		console.log(error)
		// $scope.toast('Error al conectarse con el servidor, intentelo mas tarde');
	});

	$scope.relatorio=function(){
	 	$http.post("/relatorio",{
	 		desde_ano: $scope.desde_ano,
		 	desde_mes: $scope.desde_mes,
		 	hasta_mes: $scope.hasta_mes,
		 	hasta_ano: $scope.hasta_ano,
		 	consultoresSelec: $scope.consultoresSelec

	 	})

	 	.success(function(data,status,headers,config){
	 		//$scope.relatorio=true;	
	 		var group_meses=collect(data[0]).groupBy("no_usuario").all();
	 		$scope.relatorioData=group_meses;	
	 		var group_tot=collect(data[1]).groupBy("no_usuario").all();
	 		$scope.relatorioData_tot=group_tot;	
	 	})
	  	.error(function(error,status,headers,config){
	  		console.log(error);
	  	});
	} 

	$scope.cambiar = function(nombreConsultor) {
		$scope.consultoresSelec.push(nombreConsultor);
	}	

	function barra_consultores(cons){
		var data= {
				label:cons.items[0].no_usuario,
				backgroundColor: '#D1D5D9',
				borderColor: '#D5F5D3',
				borderWidth: 1,
				data: receita(cons.items),

		}
}
		$scope.receita=receita;
		function receita(meses, custo_fixo_medio) {
			 $scope.desde_ano
		 	 $scope.desde_mes
		 	 $scope.hasta_mes
		 	 $scope.hasta_ano
		 	 //console.log('hh',$scope.desde_mes);
			var fc_desd=moment().month($scope.desde_mes).year($scope.desde_ano);
			var fc_hasta=moment().month($scope.hasta_mes).year($scope.hasta_ano);
			var dif=fc_hasta.diff(fc_desd, 'months');
			var rango=function(dif, desde_mes){
				desde_mes=parseInt(desde_mes)+1;
				return '-'.repeat(dif).split('').reduce(function(val, i){
					val.push(val[val.length-1]+1);
					return val;
				}, [desde_mes])
			}
			var rango_meses=rango(dif,$scope.desde_mes);
			return rango_meses.map(function(value){
				$scope.custo_fixo_p.data.push(custo_fixo_medio);
				var res=collect(meses).where('mes',value);
				var r=res.all();
				//console.log(r);

				if(r.length===0){
					return 0;
				}else{
					return res.all()[0].receita_liquida;
				}
			})
		}

		function barra(barChartData) {
			//console.log(barChartData);
			if(window.myBar!=undefined){

				window.myBar.destroy();
			}
			var ctx = document.getElementById('canvas_bar').getContext('2d');
			window.myBar = new Chart(ctx, {
				type: 'bar',
				data: barChartData,
				options: {
					responsive: true,
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: 'Desempeño de Consultores y Costo Fijo Medio'
					}
				}
			});

		};

		$scope.mostrar_bar=mostrar_bar;
		function mostrar_bar(barChartData) {
			$http.post("/relatorio",{
	 			desde_ano: $scope.desde_ano,
			 	desde_mes: $scope.desde_mes,
			 	hasta_mes: $scope.hasta_mes,
			 	hasta_ano: $scope.hasta_ano,
			 	consultoresSelec: $scope.consultoresSelec
	 		}).then(function(data){
	 			
	 			var group_meses=collect(data.data[0]).groupBy("no_usuario").all();
	 			//console.log(group_meses);
	 			
	 			var opc_grafico={
	 				 data:{}
	 			}
	 			var fc_desd=moment().month($scope.desde_mes).year($scope.desde_ano);
				var fc_hasta=moment().month($scope.hasta_mes).year($scope.hasta_ano);
				var dif=fc_hasta.diff(fc_desd, 'months');

	 			opc_grafico.labels=$scope.rango(dif,$scope.desde_mes).map(function(val){
	 				 		return $scope.meses[val].name;
	 			});
	 				 			//console.log(group_meses);

	 			var custo_fixo_tot=0;

	 			var sum_cons=Object.keys(group_meses).length;

	 			
	 			Object.keys(group_meses).map(function(val){

	 					custo_fixo_tot+=group_meses[val].items[0].custo_fixo;

	 			})
	 				var custo_fixo_medio=custo_fixo_tot/sum_cons;
	 			opc_grafico.datasets=Object.keys(group_meses).map(function(val){

	 				return {
							label:val,
							backgroundColor:getRandomColor(),
							borderColor: '#ccc',
							borderWidth: 1,
							data:$scope.receita(group_meses[val].items, custo_fixo_medio)
					}
	 			});
	 			opc_grafico.datasets.push($scope.custo_fixo_p);
	 			//console.log(opc_grafico);				 			
	 			barra(opc_grafico);
	 		})
		};
		$scope.rango=function(dif, desde_mes,suma1){
				desde_mes=parseInt(desde_mes);
				if(suma1){
					desde_mes+=1;
				}				
				return '-'.repeat(dif).split('').reduce(function(val, i){
					val.push(val[val.length-1]+1);
					return val;
				}, [desde_mes])
			}

			function getRandomColor() {
  				var letters = '0123456789ABCDEF';
				  var color = '#';
				  for (var i = 0; i < 6; i++) {
				    color += letters[Math.floor(Math.random() * 16)];
				  }
				  return color;
				}


				$scope.pizza=pizza;
				function pizza(){
				var ctx = document.getElementById('canvas_pie');
				ctx.width=ctx.width;
				$http.post("/relatorio",{
	 		desde_ano: $scope.desde_ano,
		 	desde_mes: $scope.desde_mes,
		 	hasta_mes: $scope.hasta_mes,
		 	hasta_ano: $scope.hasta_ano,
		 	consultoresSelec: $scope.consultoresSelec

	 	}).then(function(data){
	 	var totales=collect(data.data[1]).groupBy("no_usuario");
	 		 //	console.log(totales);

	 	var tot_recl=Object.keys(totales.items).reduce(function(acum, val){
	 		//console.log(val);

	 		var consultor=totales.items[val].items[0];
	 		//console.log(acum, consultor.tot_rec_liq);
	 		return acum+consultor.tot_rec_liq;


	 			},0)

	 	//console.log(tot_recl);
	 	var  nombres_c=[];
	 	var  colors=[];
	 	var porc_rec_liq= Object.keys(totales.items).map(function(val){
	 				var consultor=totales.items[val].items[0];
	 				nombres_c.push(consultor.no_usuario);
	 				colors.push(getRandomColor());
	 				return (consultor.tot_rec_liq*100)/tot_recl;

	 			})	 	

	 	var config = {
			type: 'pie',
			data: {
				datasets: [

				{
					data: porc_rec_liq,
					backgroundColor: colors,
					label: 'Dataset 1'
				}

				],
				labels:nombres_c
			},
			options: {
				responsive: true
			}
		};

		var ctx = document.getElementById('canvas_pie').getContext('2d');
			if(window.myPie!=undefined){

				window.myPie.destroy();
			}
			window.myPie = new Chart(ctx, config);


	 	})

			


	}

			
};
