$(document).ready(function() {
	var allActions=[];
	var allAction = 0;
	// var UCDLists;
	// var JenkinsLists;
	// var DockerLists;
	// var ChatbotLists;
	// var UCDCards;
	// var JenkinsCards;
	// var DockerCards;
	// var ChatbotCards;
	var origCards;
	var cardLabels = {};
	var allLabels=JSON.parse(localStorage.getItem('allLabels')) || [];
	var labels={};
	var lastActionNumber=localStorage.getItem('lastActionNumber') || '0';
	var allCards = [];
	var allLists = [];
	var allFlags = [];

	var authenticationSuccess = function() {
	    var kanban = '58584818c6622f7b10ad7166';

	    var failure = function() {
			console.log("Tu chutiya hai");
		}

		var updateBoard = function(allActions, i, board, boardname, listToCheck, cardToUpdate){
			if (i == -1){
				// console.log("Returning emptiness");
				localStorage.setItem("lastActionNumber", allActions.length.toString());
				var strLabels = JSON.stringify(allLabels);
				localStorage.setItem("allLabels", strLabels);
			}
			else {
				var actionItem = allActions[i].type;
				if(actionItem == "createList"){
					// console.log("Creating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; 
					var listId = listInfo.id;

					if (!(listName in listToCheck) && !(listId in listToCheck)) {
						// console.log("NEW: Creating List")
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
							listToCheck[tempName] = tempPid;
													
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},1000);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},1000);
					}
				}
				else if(actionItem == "updateList") {
					// console.log("Updating List");
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name;
					var old = dataInfo.old;
					var oldName = old.name;
					
					// console.log(listName);
					// console.log(oldName);

					if (oldName in listToCheck) {
						var listId = listToCheck[oldName];;
						delete listToCheck[oldName];

						var tempLink = '/lists/'+listId;
						// delete listToCheck[oldName];
						
						var upList = {
							name: listName
						}

						Trello.put(tempLink, upList, function SuccessAdd(data){
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							listToCheck[tempName] = tempPid;
							
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},1000);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},1000);
					}
				}
				else if (actionItem == "createCard"){
					// console.log("Creating Card");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var cardList = dataInfo.list;
					var listName = cardList.name; 

					if ((listName in listToCheck) && !(cardName in cardToUpdate) && (cardLabels[cardName] == boardname)) {
						
						var newCard;
						newCard = {
							name: cardName,
							idBoard: board,
							idList: listToCheck[listName]
						};
						
						Trello.post('/cards/', newCard, function SuccessAdd(data){
							// console.log("Card added with data: ");
							// console.log(data);

							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							// console.log(tempData);
							cardToUpdate[tempName] = tempPid;
													
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},1000);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},1000);
					}
				}
				else if (actionItem == "updateCard") {
					// console.log("Updating Card");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var newList = dataInfo.listAfter;
					if(newList != null) {
						console.log("Updating Card");
						var newListName = newList.name;

						if ((newListName in listToCheck) && (cardName in cardToUpdate)) {
							var cardId = cardToUpdate[cardName];;
							// console.log("__________________");
							// console.log(listToCheck);
							// console.log(cardToUpdate);
							// console.log(newList);
							// console.log(cardName);
							// console.log("__________________");
							var updatedCard = {
								value: listToCheck[newListName]
							};

							var tempLink = '/cards/'+cardId+'/idList';
							Trello.put(tempLink, updatedCard, function SuccessAdd(data){
								console.log("Card updated");
								console.log(data);						
								setTimeout(function () {
									updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
								},1000);
							});
						}
						else {
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},1000);
						}
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},1000);	
					}
				}
				else {
					setTimeout(function () {
						updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
					},1000);	
				}
			}
		}

		// var createList = function(allActions, i, board, boardname){
		// 	if (UCDLists == null){
		// 		UCDLists={};
		// 	}
		// 	if (JenkinsLists == null){
		// 		JenkinsLists={};
		// 	}
		// 	if (ChatbotLists == null){
		// 		ChatbotLists={};
		// 	}
		// 	if (DockerLists == null){
		// 		DockerLists={};
		// 	}
		// 	if (UCDCards == null){
		// 		UCDCards={};
		// 	}
		// 	if (JenkinsCards == null){
		// 		JenkinsCards={};
		// 	}
		// 	if (ChatbotCards == null){
		// 		ChatbotCards={};
		// 	}
		// 	if (DockerCards == null){
		// 		DockerCards={};
		// 	}

		// 	updateBoard(allActions, i, board, boardname, , );
				
		// 	if (boardname == "UCD"){
		// 		updateBoard(allActions, i, board, boardname, UCDLists, UCDCards);
		// 	}
		// 	if (boardname == "Jenkins"){
		// 		updateBoard(allActions, i, board, boardname, JenkinsLists, JenkinsCards);
		// 	}
		// 	if (boardname == "Chatbot"){
		// 		updateBoard(allActions, i, board, boardname, ChatbotLists, ChatbotCards);
		// 	}
		// 	if (boardname == "Docker"){
		// 		updateBoard(allActions, i, board, boardname, DockerLists, DockerCards);
		// 	}
		// }
		
		var perBoard = function(actionData, a, i, flag, l, c){
			lastActionNumber = localStorage.getItem('lastActionNumber') || '0';
			
			if (flag) {

				updateBoard(actionData, actionData.length-1, a, i, l, c);

			} else if (actionData.length > parseInt(lastActionNumber)) {

				var newActions=[];

				for (var j=parseInt(lastActionNumber); j < actionData.length; j++){
					newActions.push(actionData[j]);
				}

				setTimeout(function () {
					updateBoard(newActions, newActions.length-1, a, i, l, c);					
				},5000);

			} else {
				console.log("F U");
			}
		}

		var boardCreate = function(a, i, l, c, flag){
			console.log("GETTING BOARDS");
			if (i == -1){
				var link1 = "/boards/"+kanban+"/cards";				
				Trello.get(link1, function getCards(data){
					
					var tempCards = data.cards;

					for (var i = 0; i < data.length; i++){
						cardLabels[data[i].name] = data[i].labels[0].name;
					}

					if(origCards == null)
						origCards=[];

					origCards = data;

					var link = "/boards/"+kanban+"/actions";

					Trello.get(link, function getSuccess(actionData){
						for (var i in allLabels) {
							perBoard(actionData, allLabels[i], i, flag[i], l[i], c[i]);
						}
					}, failure);

				}, failure);
			}
			else {
				if (flag[i]){
					var newBoard = {
						name: a[i]
					}
					Trello.post('/boards/', newBoard, function successBoard(data){
						
						allLabels[a[i]] = data.id;
						
						setTimeout(function () {
							boardCreate(a, i-1, l, c, flag);
						},1000);

					}, failure);
				} else {
					setTimeout(function () {
						boardCreate(a, i-1, l, c, flag);
					},1000);
				}
			}			
		}

		var createBoard = function(data) {
			console.log("GETTING LABELS");
			labels = data.labelNames;
			allLabels = JSON.parse(localStorage.getItem('allLabels')) || {};
			for (var i in labels){
				console.log(labels[i]);
				if (labels[i] == ""){
					continue;
				}
				else if (!(labels[i] in allLabels)){
					allLabels[labels[i]] = "";
					allLists[labels[i]] = {};
					allCards[labels[i]] = {};
					allFlags[labels[i]] = true;
				} else {
					allFlags[labels[i]] = false;
					console.log("Set flag to false");
				}
			}
			console.log(allLabels);

			setTimeout(function () {
				boardCreate(Object.keys(allLabels), Object.keys(allLabels).length-1, allLists, allCards, allFlags);
			},1000);
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