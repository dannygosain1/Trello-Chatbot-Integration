$(document).ready(function() {
	var limit = 0;
	while(limit < 10){
		setTimeout(function() {
			$('#test').trigger('click');
		},1000);
	limit++;
	}
});