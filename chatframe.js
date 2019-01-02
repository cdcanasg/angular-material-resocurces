myApp
	.controller('chatFrame', function ($scope,$mdMedia,$mdDialog,$log,$mdSidenav,$http,$q,$firebaseArray,$firebaseAuth,$firebaseObject,HTTPRequest,openCloseChat,userData) {
		
		$scope.openCloseChat=openCloseChat;

		$scope.load={users:true};

		$scope.enableTextField=false;

		$scope.currentChat={};

		userData.promise.then(function(response){
			userData.set(response);
			$scope.userData=userData.data;
			this.email=userData.data.email;
			this.password=userData.data.password;
			this.joomlaUID=userData.data.id;
			$scope.logIn(this.email,this.password,this.joomlaUID);
		});

		var usuariosOnlinePromise= new HTTPRequest.getRequest('senecaredirect','senecaredirect.getUsuariosOnline');
		usuariosOnlinePromise.then(function(response){
			$scope.usuariosOnline=response;
			$scope.load.users=false;
		});
	    
	    $scope.getUsuariosQuery=function(value) {
	    	$scope.load.users=true;
	    	$scope.showTab(value);
    		$scope.usuariosOnline={};
	    	var usuariosOnlinePromise= new HTTPRequest.getRequest('senecaredirect','senecaredirect.getUsuariosOnline');
			usuariosOnlinePromise.then(function(response){
				$scope.usuariosOnline=response;
				$scope.load.users=false;
			});
	    };

	    $scope.showTab=function(value){
	    	for(key in $scope.openCloseChat.showViews){
	    		if (key==value) {
	    			$scope.openCloseChat.showViews[key]=true;
	    		}else{
	    			$scope.openCloseChat.showViews[key]=false;
	    		}
	    	}
	    };

	    $scope.closeChatFrame=function(){
	    	openCloseChat.set(false);
	    	for(key2 in $scope.userChats){
				firstChar=key2.charAt(0);
				if (firstChar!='$' && key2!='forEach') {
					//$scope.userChats[key2].show=false;
					//$scope.userChats[key2].newMessages=false;
				}
			}
	    };

	    $scope.logIn=function(email,password,joomlaUID){
		var auth = $firebaseAuth();
		auth.$signInWithEmailAndPassword(email,password).then(function(firebaseUser){
			$scope.firebaseUser = firebaseUser;
			
			var usersRef = firebase.database().ref().child('users').child(firebaseUser.uid);
			$scope.users=$firebaseObject(usersRef);

			var activeRelationsRef = firebase.database().ref().child('joomlaUID').child(joomlaUID);
			$scope.activeRelations=$firebaseObject(activeRelationsRef);

			var userChatRef = firebase.database().ref().child('userChats').child($scope.firebaseUser.uid);
			$scope.userChats=$firebaseObject(userChatRef);

			$scope.userChats.$loaded().then(function(){
				for(key2 in $scope.userChats){
					firstChar=key2.charAt(0);
					if (firstChar!='$' && key2!='forEach') {
						$scope.userChats[key2].show=false;
					}
				}
				$scope.userChats.$save();
			});

			$scope.$watchCollection('userChats',function(newCollection,oldCollection){
				if (newCollection != oldCollection) {
			    	for(key in newCollection){
			    		objectA=newCollection[key];
			    		if (objectA!=null) {
				    		if (objectA.newMessages) {
			    				userData.newMessages=true;
			    				break;
				    		}
				    	}
			    	}
			    }	
			});
			
		}).catch(function(error){
			switch(error.code){
				case 'auth/user-not-found':
					auth.$createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
					    $scope.firebaseUser=firebaseUser;
					    
					    var usersRef = firebase.database().ref().child('users').child(firebaseUser.uid);
						$scope.users=$firebaseObject(usersRef);
						$scope.users.$loaded().then(function(){
							$scope.users.$value={'joomlaUID':joomlaUID};
							$scope.users.$save();
						});

						var activeRelationsRef = firebase.database().ref().child('joomlaUID').child(joomlaUID);
						$scope.activeRelations=$firebaseObject(activeRelationsRef);
						$scope.users.$loaded().then(function(){
							$scope.activeRelations.uid=firebaseUser.uid;
							$scope.activeRelations.$save();
						});

						var userChatRef = firebase.database().ref().child('userChats').child(firebaseUser.uid);
						$scope.userChats=$firebaseObject(userChatRef);
						$scope.userChats.$loaded().then(function(){
							$scope.userChats.$value=true;
							$scope.userChats.$save();
						});

					}).catch(function(error) {
					   	$scope.error=error.message;
					});

					break;
			}
		});
		$scope.logedIn=true;
	};

		$scope.requestConnection=function(joomlaUIDPartner,dataPartner){
			this.joomlaUID=$scope.userData.id;
			if ($scope.activeRelations.hasOwnProperty(joomlaUIDPartner)) {
				chatUID=getChatUID($scope.userData.id,joomlaUIDPartner);
				userChatData=$scope.userChats[chatUID];
				$scope.openChat(chatUID,userChatData);
			}else{
				$scope.activeRelations.$loaded().then(function(){
					$scope.activeRelations[joomlaUIDPartner]={new:false,value:true};
					$scope.activeRelations.$save();
				});

				var partnerRelationsRef = firebase.database().ref().child('joomlaUID').child(joomlaUIDPartner);
				$scope.partnerRelations=$firebaseObject(partnerRelationsRef);
				$scope.partnerRelations.$loaded().then(function(){
					$scope.partnerRelations[this.joomlaUID]={new:true,value:false};
					$scope.partnerRelations[this.joomlaUID].data=$scope.userData;
					$scope.partnerRelations.$save();	
				});
				
				
				if (this.joomlaUID<joomlaUIDPartner) {
					var chatUID=btoa(this.joomlaUID+joomlaUIDPartner);
				}else{
					var chatUID=btoa(joomlaUIDPartner+this.joomlaUID);
				}
				
				var chatsRoomRef=firebase.database().ref().child('chatsRoom').child(chatUID);
				$scope.chatsRoom=$firebaseObject(chatsRoomRef);
				$scope.chatsRoom.$loaded().then(function(){
					$scope.chatsRoom.members={};
					$scope.chatsRoom.members[$scope.firebaseUser.uid]=true;
					$scope.chatsRoom.$save();	
				});
				

				$scope.userChats[chatUID]={'joomlaUIDPartner':joomlaUIDPartner,data:dataPartner};
				$scope.userChats.$save();

				var fecha=new Date().getTime();
				var messageUID=fecha+'-'+$scope.firebaseUser.uid;
				var chatMessagesRef=firebase.database().ref().child('chatMessages');
				$scope.chatMessages=$firebaseObject(chatMessagesRef);
				$scope.chatMessages.$loaded().then(function(){
					$scope.chatMessages[chatUID]={};
					$scope.chatMessages[chatUID][messageUID]={
						sentBy:$scope.firebaseUser.uid,
						joomlaUID:this.joomlaUID,
						fecha:fecha,
						email:$scope.firebaseUser.email,
						name:$scope.userData.name,
						avatar:$scope.userData.avatar,
						message:'Hemos iniciado un chat'
					};

					$scope.chatMessages.$save();
				});
			}
		};

		$scope.aceptInvitation=function(joomlaUIDPartner,dataPartner){
			var joomlaUID=$scope.userData.id;
			if (joomlaUID<joomlaUIDPartner) {
				var chatUID=btoa(joomlaUID+joomlaUIDPartner);
			}else{
				var chatUID=btoa(joomlaUIDPartner+joomlaUID);
			}
			
			var chatsRoomRef=firebase.database().ref().child('chatsRoom').child(chatUID);
			$scope.chatsRoom=$firebaseObject(chatsRoomRef);
			$scope.chatsRoom.$loaded().then(function(){
				$scope.chatsRoom.members[$scope.firebaseUser.uid]=true;
				$scope.chatsRoom.$save();
			});
			
			$scope.userChats[chatUID]={'joomlaUIDPartner':joomlaUIDPartner,data:dataPartner.data};
			$scope.userChats.$save();

			$scope.activeRelations[joomlaUIDPartner].new=false;
			$scope.activeRelations[joomlaUIDPartner].value=true;
			$scope.activeRelations.$save();
		};

		$scope.openChat=function(key,data){
			$scope.enableTextField=true;

			for(key2 in $scope.userChats){
				firstChar=key2.charAt(0);
				if (firstChar!='$' && key2!='forEach') {
					if (key2!=key) {
						$scope.userChats[key2]['show']=false;
					}else{
						$scope.userChats[key2]['show']=true;
						$scope.currentChat=$scope.userChats[key2];
					}
				}
			}
			$scope.userChats[key]['newMessages']=false;
			$scope.userChats.$save();

		  	var messages=firebase.database().ref().child('chatMessages').child(key);
		  	$scope.chatMessagesObject=$firebaseObject(messages);
		  	$scope.chatMessagesArray=$firebaseArray(messages);

		  	$scope.showTab('messages');
		};

	  	$scope.addMessage = function() {
	  		if ($scope.newMessageText!='') {
		  		//Reportar el envío  de mensajes a la persona que comparte este chat
		  		//Consulta del UID del partner
		  		var chatPartnerRef=firebase.database().ref().child('chatsRoom').child($scope.chatMessagesObject.$id);
		  		var chatPartner=$firebaseObject(chatPartnerRef);
		  		chatPartner.$loaded().then(function(){
		  			for(key in chatPartner.members){
		  				if (key!=$scope.firebaseUser.uid) {
		  					var chatPartnerUID=key;
		  					break;
		  				}
		  			}
		  			
		  			//modificación del parámetro newMessages: Reportando nuevos mensajes
		  			var userChatPartnerRef=firebase.database().ref().child('userChats').child(chatPartnerUID).child($scope.chatMessagesObject.$id);
		  			var userChatPartner=$firebaseObject(userChatPartnerRef);
		  			userChatPartner.$loaded().then(function(){
		  				userChatPartner.newMessages=true;
		  				userChatPartner.$save();
		  			});

		  			//modificación Reporte general de nuevos mensajes
		  			var userPartnerRef=firebase.database().ref().child('users').child(chatPartnerUID);
		  			var userPartner=$firebaseObject(userPartnerRef);
		  			userPartner.$loaded().then(function(){
		  				userPartner.newMessages=true;
		  				userPartner.$save();
		  			});

		  		});

		  		var fecha=new Date().getTime();
				var uid=$scope.firebaseUser.uid;
				var messageUID=btoa(fecha+uid);

		  		var newRow={
		      		fecha:fecha,
		      		message: $scope.newMessageText,
		      		sentBy:uid,
		      		joomlaUID:$scope.userData.id,
		      		name:$scope.userData.name,
		      		avatar:$scope.userData.avatar,
		      		email:$scope.firebaseUser.email
		    	};
		    	$scope.chatMessagesObject[fecha+'-'+uid]=newRow;
			    $scope.chatMessagesObject.$save();
			    $scope.newMessageText='';
			}
		};

		getChatUID=function(joomlaUID,joomlaUIDPartner){
			if (this.joomlaUID<joomlaUIDPartner) {
				var chatUID=btoa(this.joomlaUID+joomlaUIDPartner);
			}else{
				var chatUID=btoa(joomlaUIDPartner+this.joomlaUID);
			}

			return	chatUID;
		}
	})
;