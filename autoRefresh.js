$(document).ready(function() {
	$('#test').trigger('click');
	
	$('#test').click(function() {
		console.log("90CM!!!!");
		setTimeout(function() {
			$('#test').trigger('click');
		},1000);
	});

});