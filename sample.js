$(document).ready(function() {
	var allActions;
	var UCDLists={};

	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

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
			console.log(data);
			var name = data.name;
			var pid = data.id;
			UCDLists[name] = pid;
		}

		var createList = function(allActions,i){
			var arrayList = {};
			if (i == -1){
				console.log("Returning emptiness");
				return arrayList;
			}
			else {
				var actionItem = allActions[i].type;

				if(actionItem == "createList"){
					var dataInfo = allActions[i].data;
					var listInfo = dataInfo.list;
					var listName = listInfo.name; 

					console.log(UCDLists);	

					var newList = {
						name: listName,
						idBoard:UCD_Board,
						pos:'bottom'
					}
					
					Trello.post('/lists/', newList, function SuccessAdd(err,data){
						arrayList = createList(allActions,i-1);
						var name = data.name;
						var pid = data.id;
						arrayList[name] = pid;
						console.log("SuccessAdd UCD Lists for " + i + " is " + arrayList);
						return arrayList;
					});
				}
				else {
					arrayList = createList(allActions,i-1);
					return arrayList;
				}
			}
		}

		var getSuccess = function(data) {
			console.log(data.length);
			createList(data, data.length-1, function callBackFnc(error, ucd){
				if (error) console.error('Im stuck', error);
				else console.log("Im done", ucd);
			});
			console.log("recursive call starting");
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