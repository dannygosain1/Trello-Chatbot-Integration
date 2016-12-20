$(document).ready(function() {
	var allActions=[]; //list of actions in the kanban(master) board [example - "createCard", "updateCard"]
	var allAction = 0;
	var origCards;
	var cardLabels = {};
	var allLabels=JSON.parse(localStorage.getItem('allLabels')) || []; //list of labels on the kanban board
	var labels={};
	var lastActionNumber=localStorage.getItem('lastActionNumber') || '0'; //storing the last action number to avoid duplicate commands upon page reload
	var allCards = JSON.parse(localStorage.getItem('allCards')) || [];
	var allLists = JSON.parse(localStorage.getItem('allLists')) || [];
	var allFlags = JSON.parse(localStorage.getItem('allFlags')) || [];
	
	//The page will automatically trigger updating boards after 10 seconds of load
	setTimeout(function() {
		$('#update').trigger('click');
	},5000);

	var authenticationSuccess = function() {
	    var kanban = '58584818c6622f7b10ad7166'; // id of the master board (board to make changes from)

	    var failure = function() {
			console.log("Failed!"); // Generic failure message for now (CHANGE ME!)
		}

		// Updates the boards with the changes in the master board
		var updateBoard = function(allActions, i, board, boardname, listToCheck, cardToUpdate){
			//  saves all the changes on the browser when completed
			if (i == -1){
				var strLabels = JSON.stringify(allLabels);
				localStorage.setItem("allLabels", strLabels); // storing labels to avoid duplications
				var strCards = JSON.stringify(allCards);
				localStorage.setItem("allCards", strCards); // storing cards to avoid duplications
				var strLists = JSON.stringify(allLists);
				localStorage.setItem("allLists", strLists); // storing lists to avoid duplications
				var strFlags = JSON.stringify(allFlags);
				localStorage.setItem("allFlags", strFlags); // storing flags to avoid duplications
				console.log("Boards updated!");
			}
			else {
				var actionItem = allActions[i].type;
				// Creating list on a board
				if(actionItem == "createList"){
					console.log(allActions[i]);
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; // name of the list in the master board
					var listId = listInfo.id; //id of the list in the master board

					// creating new list
					if (!(listName in listToCheck) && !(listId in listToCheck)) {
						var newList = {
							name: listName,
							idBoard: board,
							pos:'bottom'
						}
						Trello.post('/lists/', newList, function SuccessAdd(data){
							// Avoiding dublicate creation of lists
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							listToCheck[tempName] = tempPid;
													
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},50);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},50);
					}
				}

				// Updating to see any changes to the list
				else if(actionItem == "updateList") {
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name;
					var old = dataInfo.old;
					var oldName = old.name;

					if (oldName in listToCheck) {
						var listId = listToCheck[oldName];;
						delete listToCheck[oldName];

						var tempLink = '/lists/'+listId;
						
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
							},50);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},50);
					}
				}
				else if (actionItem == "createCard"){
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var cardList = dataInfo.list;
					var listName = cardList.name; 

					if ((listName in listToCheck) && !(cardName in cardToUpdate) && (cardLabels[cardName].indexOf(boardname) >= 0)) {
						
						var newCard;
						newCard = {
							name: cardName,
							idBoard: board,
							idList: listToCheck[listName]
						};
						
						Trello.post('/cards/', newCard, function SuccessAdd(data){
							var tempData = data;
							var tempName = tempData.name;
							var tempPid = tempData.id;
							cardToUpdate[tempName] = tempPid;
													
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},50);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},50);
					}
				}
				else if (actionItem == "updateCard") {
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var newList = dataInfo.listAfter;
					if(newList != null) {
						var newListName = newList.name;

						if ((newListName in listToCheck) && (cardName in cardToUpdate)) {
							var cardId = cardToUpdate[cardName];

							var updatedCard = {
								value: listToCheck[newListName]
							};

							var tempLink = '/cards/'+cardId+'/idList';
							Trello.put(tempLink, updatedCard, function SuccessAdd(data){			
								setTimeout(function () {
									updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
								},50);
							});
						}
						else {
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},50);
						}
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},50);	
					}
				}
				else {
					setTimeout(function () {
						updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
					},50);	
				}
			}
		}

		var perBoard = function(actionData, a, i, flag, l, c){			
			if (flag) {
				updateBoard(actionData, actionData.length-1, a, i, l, c);
			} else if (actionData.length > parseInt(lastActionNumber)) {

				var newActions=[];

				for (var j=parseInt(lastActionNumber); j < actionData.length; j++){
					newActions.push(actionData[j]);
				}

				setTimeout(function () {
					updateBoard(newActions, newActions.length-1, a, i, l, c);					
				},1000);

			} else {
				console.log("Nothing to update");
			}
		}

		var boardCreate = function(a, i, l, c, flag){
			if (i == -1){
				var link1 = "/boards/"+kanban+"/cards";				
				Trello.get(link1, function getCards(data){
					
					var tempCards = data.cards;

					for (var i = 0; i < data.length; i++){
						if(data[i].labels != null){
							cardLabels[data[i].name] = "";
							for (var xyz=0; xyz < data[i].labels.length; xyz++){
								cardLabels[data[i].name] += data[i].labels[xyz].name;
							}
						}
					}

					if(origCards == null)
						origCards=[];

					origCards = data;

					var link = "/boards/"+kanban+"/actions";

					Trello.get(link, function getSuccess(actionData){
						localStorage.setItem("lastActionNumber", actionData.length.toString());
						for (var i in allLabels) {
							perBoard(actionData, allLabels[i], i, flag[i], l[i], c[i]);
						}
					}, failure);

				}, failure);
			}
			else {
				if (flag[a[i]]){
					var newBoard = {
						name: a[i]
					}
					Trello.post('/boards/', newBoard, function successBoard(data){
						
						allLabels[a[i]] = data.id;
						
						setTimeout(function () {
							boardCreate(a, i-1, l, c, flag);
						},50);

					}, failure);
				} else {
					setTimeout(function () {
						boardCreate(a, i-1, l, c, flag);
					},50);
				}
			}			
		}

		var createBoard = function(data) {
			console.log("GETTING LABELS");
			labels = data.labelNames;
			allLabels = JSON.parse(localStorage.getItem('allLabels')) || {};
			allCards = JSON.parse(localStorage.getItem('allCards')) || {};
			allLists = JSON.parse(localStorage.getItem('allLists')) || {};
			allFlags = JSON.parse(localStorage.getItem('allFlags')) || {};
			for (var i in labels){
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
				}
			}

			setTimeout(function () {
				boardCreate(Object.keys(allLabels), Object.keys(allLabels).length-1, allLists, allCards, allFlags);
			},50);
		}
		
		Trello.get('/boards/'+kanban,createBoard,failure);

	};

	var authenticationFailure = function() {
	    console.log("Failed authentication");
	};

	$('#update').click(function() {
		lastActionNumber=localStorage.getItem('lastActionNumber') || '0';
		console.log("Boards updating if needed");
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

		setTimeout(function() {
			$('#update').trigger('click');
		},120000);
	});

	$('#test').click(function() {
		Trello.get('/boards/', function(data){
			console.log(data);
		}, failure);
	});
});