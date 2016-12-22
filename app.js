$(document).ready(function() {
	var allActions=[]; //list of actions in the master(master) board [example - "createCard", "updateCard"]
	var cardLabels = {};
	var allLabels=JSON.parse(localStorage.getItem('allLabels')) || []; //list of labels on the master board
	var labels={};
	var lastActionNumber=localStorage.getItem('lastActionNumber') || '0'; //storing the last action number to avoid duplicate commands upon page reload
	var allCards = JSON.parse(localStorage.getItem('allCards')) || [];
	var allLists = JSON.parse(localStorage.getItem('allLists')) || [];
	var allFlags = JSON.parse(localStorage.getItem('allFlags')) || [];

    var master = '58584818c6622f7b10ad7166'; // id of the master board (board to make changes from)

	//The page will automatically trigger updating boards after 10 seconds of load
	setTimeout(function() {
		$('#update').trigger('click');
	},5000);

	var authenticationSuccess = function() {
	    document.getElementById('update').style.visibility='hidden';
	    var failure = function() {
			console.log("Unknown error"); // Generic failure message for now (CHANGE ME!)
		}

		var boardCreationFailure = function() {
			console.log("Error in creating the boards!");
		}

		var labelsFailure = function() {
			console.log("Error in getting the names of the labels");
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
					console.log("Creating List");
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
								console.log("Updating Board with new list creations");
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},500);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},500);
					}
				}

				// Updating to see any changes to the list
				else if(actionItem == "updateList") {
					console.log("Updating List");
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
								console.log("Updating Board with new list updates");
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},500);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},500);
					}
				}

				// Creating cards on the list
				else if (actionItem == "createCard"){
					console.log("Creating card");
					var dataInfo = allActions[i].data; 
					var cardInfo = dataInfo.card; // all data about the card in JSON format
					var cardName = cardInfo.name; // card name
					var cardList = dataInfo.list; 
					var listName = cardList.name; // list name the card belongs too 

					// ensuring the card already doesn't exist in the list
					if ((listName in listToCheck) && !(cardName in cardToUpdate) && (cardLabels[cardName].indexOf(boardname) >= 0)) {
						
						// adding the card onto the list
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
								console.log("Updating Board with new card creations");
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},500);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},500);
					}
				}

				// Updating card (card movement)
				else if (actionItem == "updateCard") {
					console.log("Updating cards");
					var dataInfo = allActions[i].data;
					var cardInfo = dataInfo.card;
					var cardName = cardInfo.name;
					var newList = dataInfo.listAfter; // the new list of the card
					console.log("Updating card")
					if(newList != null) {
						var newListName = newList.name;

						if ((newListName in listToCheck) && (cardName in cardToUpdate)) {
							var cardId = cardToUpdate[cardName];

							// moving the card to the new list
							var updatedCard = {
								value: listToCheck[newListName]
							};
							console.log(cardId);
							var tempLink = '/cards/'+cardId+'/idList';
							Trello.put(tempLink, updatedCard, function SuccessAdd(data){			
								setTimeout(function () {
									console.log("Updating Board with new list updates");
									updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
								},500);
							});
						}
						// callback to update the board
						else {
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
							},500);
						}
					}
					// callback to update the board
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
						},500);	
					}
				}
				// callback to update the board
				else {
					setTimeout(function () {
						updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
					},500);	
				}
			}
		}

		// checking if any new labels were created
		var perBoard = function(actionData, a, i, flag, l, c){
			console.log("Per board function : " + lastActionNumber);			
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

		// function to create boards
		var boardCreate = function(a, i, l, c, flag){
			// exits once traversed through the list
			console.log("Board creation");
			if (i == -1){
				var link1 = "/boards/"+master+"/cards";				
				Trello.get(link1, function getCards(data){
					
					var tempCards = data.cards;
					// putting each card from the master board on their respective boards
					for (var i = 0; i < data.length; i++){
						if(data[i].labels != null){
							cardLabels[data[i].name] = "";
							for (var xyz=0; xyz < data[i].labels.length; xyz++){
								cardLabels[data[i].name] += data[i].labels[xyz].name;
							}
						}
					}

					var link = "/boards/"+master+"/actions";

					Trello.get(link, {limit: 1000}, function getSuccess(actionData){
						localStorage.setItem("lastActionNumber", actionData.length.toString());
						console.log(actionData);
						for (var i in allLabels) {
							perBoard(actionData, allLabels[i], i, flag[i], l[i], c[i]);
						}
					}, failure);

				}, boardCreationFailure);
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
						},500);

					}, failure);
				} else {
					setTimeout(function () {
						boardCreate(a, i-1, l, c, flag);
					},500);
				}
			}			
		}

		// function to get all the label values for board creation
		var createBoardbyLabels = function(data) {
			console.log("Creating boards by label");
			labels = data.labelNames;

			// parsing JSON stringified data as JSON Objects
			allLabels = JSON.parse(localStorage.getItem('allLabels')) || {};
			allCards = JSON.parse(localStorage.getItem('allCards')) || {};
			allLists = JSON.parse(localStorage.getItem('allLists')) || {};
			allFlags = JSON.parse(localStorage.getItem('allFlags')) || {};
			
			// traversing through all the labels with values and creating boards
			for (var i in labels){
				// ignores the labels colours with no values
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

			// calling function to create board			
			setTimeout(function () {
				boardCreate(Object.keys(allLabels), Object.keys(allLabels).length-1, allLists, allCards, allFlags);
			},500);
		}
		
		Trello.get('/boards/'+master,createBoardbyLabels,labelsFailure);

	};

	// Message when failed on authentication
	var authenticationFailure = function() {
	    console.log("Failed authentication");
	};

	// sets up authentication upon click of update button (automated)
	$('#update').click(function() {
		lastActionNumber=localStorage.getItem('lastActionNumber') || '0';
		console.log("Initial lastActionNumber : " + lastActionNumber);
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
		// triggers the click to the update button every 5 minutes
		setTimeout(function() {
			$('#update').trigger('click');
		},300000);
	});

	// DELETE ALL BOARDS EXCEPT MASTER

	 var test = function() {
		Trello.get('/members/me', function(data){
			localStorage.clear();
			var boardToDel = data.idBoards;
			for (var i = 0; i < boardToDel.length; i++){
				if(boardToDel[i] == master)
					continue;
				else
					Trello.put('/boards/'+boardToDel[i]+'/closed',{value: true},function(data){
						console.log(data);
						console.log("Board deleted");
					},authenticationFailure);
			}
		}, authenticationFailure);
	}
	
	$('#test').click(function() {
		Trello.authorize({
			type: 'popup',
			name: 'Getting Started Application',
			scope: {
				read: 'true',
				write: 'true' },
			expiration: 'never',
			success: test,
			error: authenticationFailure
	 	});
	}); 

});
