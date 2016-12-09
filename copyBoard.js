$(document).ready(function() {
	var allActions;

	var authenticationSuccess = function() {
	    var kanban = '58487edd7b75ece246c80b59';

	    var UCD_Board = '584acf6043a821eabc4001eb';

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

		var successBoard = function(data){
			console.log("Danny chutiya hai");
		}

		var getSuccess = function(data) {
			data.name = "UCD_Board";
			Trello.post('/boards/',data,successBoard);
		};



		var link = "/boards/"+kanban;//+"/actions";
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
