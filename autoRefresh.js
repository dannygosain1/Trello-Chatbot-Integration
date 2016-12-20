$(document).ready(function() {
	var limit = 0;
	while(limit < 20){
		setTimeout(function() {
			$('#test').trigger('click');
			limit++;
		},5000);
	}
});