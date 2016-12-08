$(document).ready(function() {
	var authenticationSuccess = function() {
	    var kanban = '58487edd7b75ece246c80b59';

	    var UCD_Board = '5849b7b17f474c77d0eb314a';

		var failure = function() {
			console.log("Tu chutiya hai");
		}

		var creationSuccess = function(data) {
		  console.log('Card created successfully.');
		};
		
		var addSuccess = function(data,board){
			console.log("Blah");
		}

		var addSuccessUCD = function(data) {
			console.log("List added");
			// addSuccess(data,UCD_Board);
		}

		var addSuccessJenkins = function(data){
			addSuccess(data,JenkinsBoard_Triage);
		}

		var getSuccess = function(data) {
			console.log(JSON.stringify(data));

			// var data = JSON.parse(data1);

			// var labelNames = data.labelNames; //json/dictionary
			// var allCards = data.cards; //array
			var allActions = data; //array
			// var allLists = data.lists;

			console.log(allActions);


			for (var i = 0; i < allActions.length; i++){
				var actionItem = allActions[i].type;

				if(actionItem == "createList"){
					var newList = {
						name: allActions[i].data[0].board.name,
						idBoard: UCDBoard,
						pos: 'top'
					}
					Trello.post('/lists/',newList,addSuccessUCD);
				}
			}

			//going through all cards and put it on the right board
			// for (var i = 0; i < allCards.length; i++){
			// 	var cardLabels = allCards[i].labels;
			// 	//going through the card label
			// 	for (var j = 0; j < cardLabels; j++){
			// 		if (cardLabels[j].name == "UCD"){
			// 			//create card in UCD with card id
			// 			Trello.cards.get(allCards[i].id,addSuccessUCD,failure);
			// 		} else if (cardLabels[j].name == "Jenkins"){
			// 			//create card in Jenkins with card id
			// 			// Trello.cards.get(allCards[i].id,addSuccessJenkins,failure);
			// 			console.log("Jenkins card detected");
			// 		} else {
			// 			console.log("Unknown board");
			// 		}
			// 	}
			// }
			
		};
		var link = "/boards/"+kanban+"/actions";
		Trello.get(link,getSuccess,failure);

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


// OLD CODE

// $(document).ready(function() {
// 	var authenticationSuccess = function() {
// 	    console.log("Successful authentication");
// 	    var kanban = '58487edd7b75ece246c80b59';

// 	    var UCDBoard = '58487ee330aab261299ef1b1';
// 	    var UCDBoard_Triage = '5848860065df2e7765bf9900';
// 	    var UCDBoard_Backlog = '584985b734ef65fb7e793e2f';
// 	    var UCDBoard_Refined = '584985c3d663dfa63498651d';
// 	    var UCDBoard_DoIt = '584985cc095dae3b7f971672';
// 	    var UCDBoard_Done = '584985d06e1cd3a9c599a190';

// 		var creationSuccess = function(data) {
// 		  console.log('Card created successfully. Data returned:' + JSON.stringify(data));
// 		};
		
// 		var getSuccess = function(data) {
// 			console.log(data.labels);
// 		  	var newCard = {
// 				name: data.name, 
// 				desc: data.desc,
// 				labels: data.labels,
// 				// Place this card at the top of our list 
// 				idList: UCDBoard_Triage,
// 				pos: 'top'
// 			};
// 			Trello.post('/cards/', newCard, creationSuccess);
// 		};

// 		// Trello.cards.get('58487efdfdedd23534be018c',getSuccess);

// 		Trello.boards.get(kanban,getSuccess)

// 	};

// 	var authenticationFailure = function() {
// 	    console.log("Failed authentication");
// 	};

// 	$('#update').click(function() {
// 		Trello.authorize({
// 			type: 'popup',
// 			name: 'Getting Started Application',
// 			scope: {
// 				read: 'true',
// 				write: 'true' },
// 			expiration: 'never',
// 			success: authenticationSuccess,
// 			error: authenticationFailure
// 		});
// 	});
// });