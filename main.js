$(document).ready(function() {
	var allActions;
	var UCDLists;

	var authenticationSuccess = function() {
	    var kanban = '58487edd7b75ece246c80b59';

	    var UCD_Board = '584acf6043a821eabc4001eb';
	    
	    var failure = function() {
			console.log("Swapnil chutiya hai");
		}

		var creationSuccess = function(data) {
		  console.log('Card created successfully.');
		};
		
		var addSuccess = function(data){
			console.log("Blah");
		}

		var addSuccessUCD = function(data) {
			console.log("List added");
			var name = data.name;
			var id = data.id;
			UCDLists[name] = id;
		}

		var addSuccessJenkins = function(data){
			addSuccess(data,JenkinsBoard_Triage);
		}

		var updateList = function(allActions){
			for (var i = allActions.length - 1; i >= 0; i--){
				(function(i) {
					var actionItem = allActions[i].type;

					console.log(actionItem);

					if(actionItem == "updateList"){

						var dataInfo = allActions[i].data;
						var old = dataInfo.old;
						var oldName = old.name;
						var listInfo = dataInfo.list;

						console.log(oldName);
						console.log("-----------------");
						console.log(UCDLists);
						console.log("-----------------");
						
						var listId = UCDLists[oldName];
						var listName = listInfo.name; 
						var tempLink = '/lists/'+listId;
						Trello.put(tempLink,listName,addSuccess);
					}
				}(i)); 
			}
		}
		var createListDo = function(allActions){
			for (var i = allActions.length - 1; i >= 0; i--){
				(function(i) {
					var actionItem = allActions[i].type;

					console.log(actionItem);

					if(actionItem == "createList"){
						var dataInfo = allActions[i].data;
						var listInfo = dataInfo.list;
						var listName = listInfo.name; 
							
						var newList = {
							name: listName,
							idBoard:UCD_Board,
							pos:'bottom'
						}
						
						Trello.post('/lists/', newList, addSuccessUCD);
					}
				}(i)); 
			}
		}

		var createList = function(allActions){
			createListDo(allActions);
		}

		var getSuccess = function(data) {
			// allActions = data;
			// createList(data).then(updateList(data));
			createList(data,updateList(data));
		}

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