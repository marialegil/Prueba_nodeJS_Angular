angular.module("MyfirstApp",[])
.controller("FirstController",function($scope,$http){
	$scope.variable="ho";
	$scope.posts=[];
	$scope.newPosts={};
	$http.get("/nombres")
	.success(function(data){
		console.log(data);
		$scope.posts=data;
	})
		.error(function(err){

	});
	$scope.addPost=function(){
	 $http.post("http://jsonplaceholder.typicode.com/posts",{
	 	title:$scope.newPost.title,
	 	body:$scope.newPost.body,
	 	userId: 1
	 })
	 .success(function(data,status,headers,config){
	 	$scope.posts.push(data);
	 	$scope.newPost={};	 
	 })
	  .error(function(error,status,headers,config){
	  	console.log(error);
	  });
	}	 
});
