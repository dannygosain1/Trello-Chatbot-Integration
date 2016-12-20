$(document).ready(function() {
	var limit = 0;

	$('#test').click(function() {
		console.log("90CM!!!!");
		setTimeout(function() {
			$('#test').trigger('click');
		},1000);
	});

});