var languages = ['JavaScript', 'CSS', 'Python', 'Markup', 'PHP', 'CoffeScript', 'Bash', 'C', 'C++', 'Ruby', 'Swift', 'Objective-C', 'Haskell'];

$(document).ready(function() {
	$('.pop').hide();

	var socket = io.connect();
	base = String(window.location).split("/")[2]

	socket.on('recent', function(data) {
		if (!data) {
			console.log("There are no recent items");
		}
		else {
			for (var i = 0; i < data[0].length; i++) {
				$li = $('<a></a>');
				$li.text(data[0][i]+" - "+languages[data[1][i]]);
				$li.attr("href", "http://"+base+"/"+data[0][i]);
				$('.pop').append($li);
			}
			$('.main').hide();
			$('.pop').show();
		}
	});

	socket.on('password', function(data) {
		if (!data) {
			$('input[type="password"]').css({
				"color": "#e74c3c",
				"border-color": "#e74c3c"
			});
			setTimeout(function() {
				$('input[type="password"]').removeAttr('style');
			}, 1000);
		}
	});
	
	$('.main .btn-primary').click(function() {
		socket.emit("password", $('input[type="password"]').val());
	});
});