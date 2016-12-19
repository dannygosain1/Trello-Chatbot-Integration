$(document).ready(function() {
	var allActions=[];
	var allAction = 0;
	var UCDLists;
	var UCDCards;
	var allCards;
	var cardLabels;
	var allLabels=[];
	var labels={};
	var lastActionNumber=localStorage.getItem('lastActionNumber') || '-1';


	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

	    var failure = function() {
			console.log("Tu chutiya hai");
		}

		var createList = function(allActions, i, board, name){
			console.log("Creating action item");
			// console.log(i);
			if (i == -1){
				console.log("Returning emptiness");
				localStorage.setItem("lastActionNumber", allActions.length.toString());
			}
			else {
				var actionItem = allActions[i].type;

				if(actionItem == "createList"){
					console.log("Creating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; 
					var listId = listInfo.id;
					
					if (UCDLists == null)
						UCDLists={};

					if (!(listName in UCDLists) && !(listId in UCDLists)) {
						console.log("NEW: Creating List")
						var newList = {
							name: listName,
							idBoard: board,
							pos:'bottom'
						}
						console.log(newList);
						
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
			console.log("getting individual board");
			// console.log(i);								
			// console.log(allLabels[i]);
			lastActionNumber = localStorage.getItem('lastActionNumber') || '0';
			// console.log("lastActionNumber:" + lastActionNumber);
			// console.log("actionData.length:" + actionData.length);

			if(actionData.length > parseInt(lastActionNumber)){
				var newActions=[];
				for (var i=parseInt(lastActionNumber); i < actionData.length; i++){
					// console.log("NEW ACTIONS ID NUMBER : "+i);
					newActions.push(actionData[i]);
					// console.log(newActions);
				}
				setTimeout(function () {
					console.log("Crating lists for id " + i + " AND " + allLabels[i]);
					createList(newActions, newActions.length-1, allLabels[i],i);					
				},5000);
			} else {
				console.log("F U");
			}
			// },failure);
		}

		var getSuccess = function(actionData) {
			console.log("Getting success function");
			// console.log(allLabels);

			for (var i in allLabels) {//not getting keys such as UCD, Jenkins
				console.log("Key name is " + i );
				perBoard(actionData, allLabels, i);
			}
		}

		var getCards = function(data) {
			console.log("in getting cards");
			
			if(allCards == null)
				allCards=[];

			allCards = data;
			//console.log(allCards);

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
				var newBoard = {
					name: a[i]
				}
				Trello.post('/boards/',newBoard, function successBoard(data){
					//console.log("Board " + data.name + " has been created with id " + data.id);
					allLabels[a[i]] = data.id;
					boardCreate(a,i-1);
				}, failure);
			}			
		}

		var createBoard = function(data) {
			console.log("Creating boards");
			labels = data.labelNames;

			for (var i in labels){
				//console.log(labels[i]);
				if (labels[i] == ""){
					continue;
				}
				else
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