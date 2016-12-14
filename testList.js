$(document).ready(function() {
	var allActions;
	var UCDLists={};

	var authenticationSuccess = function() {
	    var kanban = '58515d76d31bcd0db04fdaf4';

	    var UCD_Board = '584acf6043a821eabc4001eb';

		var link = "/boards/"+kanban+"/actions";
		var newList = {
			name: 'LIST NAME',
			idBoard: UCD_Board,
			pos:'bottom'
		}
				
		function errCall (error, i){
			if (error) console.error("ERROR");
			else console.log(i);
		}	

		var obj = Trello.post('/lists/', newList, function SuccessAdd(data, errCall){
			console.log("Hell o there");
			return "HELLO FROM THE OTHER SIDE";
		});

		// console.log(obj);
		// console.log(obj.responseText);
		// console.log(obj.status);
		// console.log(obj.statusText);

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