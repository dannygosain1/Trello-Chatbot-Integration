$(document).ready(function() {
	var allActions=[];
	var allAction = 0;
	var UCDLists;
	var UCDCards;
	var allCards;
	var cardLabels;
	var allLabels=[];

	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

	    // var UCD_Board = '5853102d128c6217a1051e6b';
	    
	    var failure = function() {
			console.log("Tu chutiya hai");
		}

		var createList = function(allActions, i, board, name){
			console.log("Creating action item");
			console.log(i);
			if (i == -1){
				console.log("Returning emptiness");
				allAction = allAction + allActions.length;
			}
			else {
				var actionItem = allActions[i].type;

				if(actionItem == "createList"){
					console.log("Creating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; 
					var listId = listInfo.id;

					console.log("Converting IDs to a string");
					var listIdString = JSON.stringify(listId);
										
					localStorage.setItem("listIdString", listIdString);

					$(document).ready(function() {
					var listId = localStorage.getItem("listIdString");
					});
					
					if (UCDLists == null)
						UCDLists={};

					if (!(listName in UCDLists) && !(listId in UCDLists)) {
						var newList = {
							name: listName,
							idBoard: board,
							pos:'bottom'
						}
						
						Trello.post('/lists/', newList, function SuccessAdd(data){
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							
							UCDLists[tempName] = tempPid;
													
							createList(allActions, i-1, board, name);
						});
					}
					else {
						createList(allActions, i-1, board, name);
					}
				}
				else if(actionItem == "updateList") {
					console.log("Updating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name;
					var old = dataInfo.old;
					var oldName = old.name;
					
					console.log(listName);
					console.log(oldName);

					if (oldName in UCDLists) {
						var listId = UCDLists[oldName];
						var tempLink = '/lists/'+listId;
						delete UCDLists[oldName];
						
						var upList = {
							name: listName
						}

						Trello.put(tempLink, upList, function SuccessAdd(data){
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							console.log(tempData);
							UCDLists[tempName] = tempPid;
							
							console.log("SuccessAdd UCD Lists for " + i + " is ");
							console.log(UCDLists);
							
							createList(allActions, i-1, board, name);
						});
					}
					else {
						createList(allActions,i-1, board, name);
					}
				}
				else if (actionItem == "createCard"){
					console.log("Creating Card");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var cardList = dataInfo.list;
					var listName = cardList.name; 
					
					if (UCDCards == null)
						UCDCards={};

					if ((listName in UCDLists) && !(cardName in UCDCards) && (cardLabels[cardName] == "UCD")) {
						var newCard = {
							name: cardName,
							idBoard: board,
							idList: UCDLists[listName]
						}
						
						Trello.post('/cards/', newCard, function SuccessAdd(data){
							console.log("Card added with data: ");
							console.log(data);

							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							console.log(tempData);
							
							UCDCards[tempName] = tempPid;
													
							createList(allActions, i-1, board, name);
						});
					}
					else {
						createList(allActions, i-1, board, name);
					}
				}
				else if (actionItem == "updateCard") {
					console.log("Updating Card");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var newList = dataInfo.listAfter;
					if(newList != null) {
						var newListName = newList.name;

						if ((newListName in UCDLists) && (cardName in UCDCards)) {
							var cardId = UCDCards[cardName];
							var tempLink = '/cards/'+cardId+'/idList';

							var updatedCard = {
								value: UCDLists[newListName]
							}
							Trello.put(tempLink, updatedCard, function SuccessAdd(data){
								console.log("Card updated");
														
								createList(allActions, i-1, board, name);
							});
						}
						else {
							createList(allActions, i-1, board, name);
						}
					}
					else {
						createList(allActions, i-1, board, name);
					}
				}
				else {
					createList(allActions, i-1, board, name);
				}
			}
		}
		
		var perBoard = function(actionData, allLabels, i){
			console.log("getting kanban board");
			var link2 = "/boards/"+allLabels[i]+"/actions";
			Trello.get(link2, function (data){
				console.log("getting " + i + " board");
				if (cardLabels == null)
					cardLabels = {};

				for(var i=0; i < allCards.length; i++){
					cardLabels[allCards[i].name] = allCards[i].labels[0].name;
				}

				allActions = data;

				console.log("-----------------------------------------");
				console.log(allActions.length);
				console.log(actionData.length);
				console.log("-----------------------------------------");		

				if(actionData.length > allAction){
					var newActions=[];
					for (var i=allAction; i < actionData.length-1; i++){
						console.log("NEW ACTIONS ID NUMBER : "+i);
						newActions.push(actionData[i]);
						console.log(newActions);
					}
					setTimeout(function () {
						createList(newActions, newActions.length-1, allLabels[i],i);					
					},3000);
				}
			},failure);
		}

		var getSuccess = function(actionData) {
			for (var i in Object.keys(allLabels)) {
				console.log("Label name is : " + i);
				perBoard(actionData, allLabels, i);
			}
			
		}

		var getCards = function(data) {
			console.log("in getting cards");
			if(allCards == null)
				allCards=[];

			allCards = data;
			console.log(allCards);

			var link = "/boards/"+kanban+"/actions";
			Trello.get(link,getSuccess,failure);
		}

		var boardCreate = function(a, i){
			if (i == -1){
				console.log("All boards created");
				// think about calling the cards details here
				var link1 = "/boards/"+kanban+"/cards";				
				Trello.get(link1,getCards,failure);
			}
			else {
				console.log(a);
				var newBoard = {
					name: a[i]
				}
				Trello.post('/boards/',newBoard, function successBoard(data){
					allLabels[a[i]] = data.id;
					boardCreate(a,i-1);
				}, failure);
			}			
		}

		var createBoard = function(data) {
			console.log("Creating boards");
			var labels = data.labelNames;

			for (var i in labels){
				console.log(labels[i]);
				allLabels[labels[i]] = "";
			}

			boardCreate(Object.keys(allLabels),Object.keys(allLabels).length-1);
		}
		
		Trello.get('/boards/'+kanban,createBoard,failure);
	};

	var authenticationFailure = function() {
	    console.log("Failed authentication");
	};

	$('#update').click(function() {
		Trello.authorize({
			type: 'popup',
			name: 'Getting Started Application',
			scope: {
				read: 'true',
				write: 'true' },
			expiration: 'never',
			success: authenticationSuccess,
			error: authenticationFailure
		});
	});
});