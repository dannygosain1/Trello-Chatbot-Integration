$(document).ready(function() {
	var limit = 0;
	while(limit < 20){
		setTimeout(function() {
			$('#test').trigger('click');
		},5000);
	limit++;
	}
});