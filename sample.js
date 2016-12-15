$(document).ready(function() {
	var allActions;
	var UCDLists={};
	var UCDCards={};
	var allCards=[];
	var cardLabels={};

	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

	    var UCD_Board = '584acf6043a821eabc4001eb';
	    
	    var failure = function() {
			console.log("Tu chutiya hai");
		}

		var createList = function(allActions, i){
			console.log("Creating action item");
			if (i == -1){
				console.log("Returning emptiness");
			}
			else {
				var actionItem = allActions[i].type;

				if(actionItem == "createList"){
					console.log("Creating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; 
					if (!(listName in UCDLists)) {
						var newList = {
							name: listName,
							idBoard: UCD_Board,
							pos:'bottom'
						}
						
						Trello.post('/lists/', newList, function SuccessAdd(data){
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;

							UCDLists[tempName] = tempPid;
													
							createList(allActions,i-1);
						});
					}
					else {
						createList(allActions,i-1);
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
							
							createList(allActions,i-1);
						});
					}
					else {
						createList(allActions,i-1);
					}
				}
				else if (actionItem == "createCard"){
					console.log("Creating Card");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var cardList = dataInfo.list;
					var listName = cardList.name; 
					
					if ((listName in UCDLists) && !(cardName in UCDCards) && (cardLabels[cardName] == "UCD")) {
						var newCard = {
							name: cardName,
							idBoard: UCD_Board,
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
													
							createList(allActions,i-1);
						});
					}
					else {
						createList(allActions,i-1);
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
														
								createList(allActions,i-1);
							});
						}
						else {
							createList(allActions,i-1);
						}
					}
					else {
						createList(allActions,i-1);
					}
				}
				else {
					createList(allActions,i-1);
				}
			}
		}

		var getSuccess = function(data) {
			for(var i=0; i < allCards.length; i++){
				cardLabels[allCards[i].name] = allCards[i].labels[0].name;
			}
			if(data.length > allActions.length){
				var newActions=[];
				for (var i=allActions.length; i < data.length-1; i++){
					console.log("NEW ACTIONS ID NUMBER : "+i);
					newActions.append(data[i]);
					console.log(newActions);
				}
				createList(newActions, newActions.length-1);
			}
			
		}

		var getCards = function(data) {
			allCards = data;
			console.log(allCards);
		}

		var link = "/boards/"+kanban+"/actions";
		var link1 = "/boards/"+kanban+"/cards";
		Trello.get(link,getSuccess,failure);
		Trello.get(link1,getCards,failure);

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