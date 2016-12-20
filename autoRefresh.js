$(document).ready(function() {
	setTimeout(function() {
		$('#test').trigger('click');
	},1000);
	
	$('#test').click(function() {
		console.log("90CM!!!!");
		setTimeout(function() {
			$('#test').trigger('click');
		},1000);
	});

});