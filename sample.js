$(document).ready(function() {
	var allActions=[];
	var allAction = 0;
	var UCDLists;
	var JenkinsLists;
	var DockerLists;
	var ChatbotLists;
	var UCDCards;
	var JenkinsCards;
	var DockerCards;
	var ChatbotCards;
	var allCards;
	var cardLabels = {};
	var allLabels=[];
	var labels={};
	var lastActionNumber=localStorage.getItem('lastActionNumber') || '-1';


	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

	    var failure = function() {
			// console.log("Tu chutiya hai");
		}

		var updateBoard = function(allActions, i, board, boardname, listToCheck, cardToUpdate){
			if (i == -1){
				// console.log("Returning emptiness");
				localStorage.setItem("lastActionNumber", allActions.length.toString());
			}
			else {
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
						// console.log(newList);
						
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
								updateBoard(allActions, i-1, board, boardname);
							},1000);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname);
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
								updateBoard(allActions, i-1, board, boardname);
							},1000);
						});
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname);
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
						// console.log("Updating Card");
						var newListName = newList.name;

						if ((newListName in listToCheck) && (cardName in cardToUpdate)) {
							var cardId = listToCheck[cardName];;

							var updatedCard = {
								value: cardToUpdate[newListName]
							};

							var tempLink = '/cards/'+cardId+'/idList';
							Trello.put(tempLink, updatedCard, function SuccessAdd(data){
								console.log("Card updated");
								console.log(data);						
								setTimeout(function () {
									updateBoard(allActions, i-1, board, boardname);
								},1000);
							});
						}
						else {
							setTimeout(function () {
								updateBoard(allActions, i-1, board, boardname);
							},1000);
						}
					}
					else {
						setTimeout(function () {
							updateBoard(allActions, i-1, board, boardname);
						},1000);	
					}
				}
				else {
					setTimeout(function () {
						updateBoard(allActions, i-1, board, boardname);
					},1000);	
				}
			}
		}

		var createList = function(allActions, i, board, boardname){
			// console.log("Creating action item");
			// // console.log(i);
			if (i == -1){
				// console.log("Returning emptiness");
				localStorage.setItem("lastActionNumber", allActions.length.toString());
			}
			else {
				var actionItem = allActions[i].type;
				if (UCDLists == null){
					UCDLists={};
				}
				if (JenkinsLists == null){
					JenkinsLists={};
				}
				if (ChatbotLists == null){
					ChatbotLists={};
				}
				if (DockerLists == null){
					DockerLists={};
				}
				if (UCDCards == null){
					UCDCards={};
				}
				if (JenkinsCards == null){
					JenkinsCards={};
				}
				if (ChatbotCards == null){
					ChatbotCards={};
				}
				if (DockerCards == null){
					DockerCards={};
				}
					
				if (boardname == "UCD"){
					listToCheck = UCDLists;
					cardToUpdate = UCDCards;
					updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
				}
				if (boardname == "Jenkins"){
					listToCheck = JenkinsLists;
					cardToUpdate = JenkinsCards;
					updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
				}
				if (boardname == "Chatbot"){
					listToCheck = ChatbotLists;
					cardToUpdate = ChatbotCards;
					updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
				}
				if (boardname == "Docker"){
					listToCheck = DockerLists;
					cardToUpdate = DockerCards;
					updateBoard(allActions, i-1, board, boardname, listToCheck, cardToUpdate);
				}

				
			}
		}
		
		var perBoard = function(actionData, allLabels, i){
			// console.log("getting individual board");
			// // console.log(i);								
			// // console.log(allLabels[i]);
			lastActionNumber = localStorage.getItem('lastActionNumber') || '0';
			// // console.log("lastActionNumber:" + lastActionNumber);
			// // console.log("actionData.length:" + actionData.length);

			if(actionData.length > parseInt(lastActionNumber)){
				var newActions=[];
				for (var j=parseInt(lastActionNumber); j < actionData.length; j++){
					// // console.log("NEW ACTIONS ID NUMBER : "+i);
					newActions.push(actionData[j]);
					// // console.log(newActions);
				}
				setTimeout(function () {
					// console.log("Crating lists for id " + i + " AND " + allLabels[i]);
					createList(newActions, newActions.length-1, allLabels[i],i);					
				},5000);
			} else {
				// console.log("F U");
			}
			// },failure);
		}

		var getSuccess = function(actionData) {
			// console.log("Getting success function");
			// // console.log(allLabels);

			for (var i in allLabels) {//not getting keys such as UCD, Jenkins
				// console.log("Key name is " + i );
				perBoard(actionData, allLabels, i);
			}
		}

		var getCards = function(data) {
			// console.log("in getting cards");
			
			// // console.log(data);
			var tempCards = data.cards;
			
			// console.log(tempCards);
			for (var i = 0; i < data.length; i++){
				// console.log("tempCard is ");
				// console.log(data[i]);
				cardLabels[data[i].name] = data[i].labels[0].name;
			}
			console.log(cardLabels);
			if(allCards == null)
				allCards=[];

			allCards = data;
			//// console.log(allCards);

			var link = "/boards/"+kanban+"/actions";
			Trello.get(link,getSuccess,failure);
		}

		var boardCreate = function(a, i){
			if (i == -1){
				// console.log("All boards created");
				// think about calling the cards details here
				var link1 = "/boards/"+kanban+"/cards";				
				Trello.get(link1,getCards,failure);
			}
			else {
				var newBoard = {
					name: a[i]
				}
				Trello.post('/boards/',newBoard, function successBoard(data){
					//// console.log("Board " + data.name + " has been created with id " + data.id);
					allLabels[a[i]] = data.id;
					setTimeout(function () {
						boardCreate(a,i-1);
					},1000);
				}, failure);
			}			
		}

		var createBoard = function(data) {
			// console.log("Creating boards");
			labels = data.labelNames;

			for (var i in labels){
				//// console.log(labels[i]);
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
	    // console.log("Failed authentication");
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