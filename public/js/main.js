$(document).ready(function() {
	$('.popup').hide();

	var languages = ['JavaScript', 'CSS', 'Python', 'Markup', 'Java', 'PHP', 'CoffeScript', 'Bash', 'C', 'C++', 'Ruby', 'Swift', 'Objective-C', 'Haskell'];
	for (var i = 0; i < languages.length; i++) {
		var $thing = $('<option>');
		$thing.attr("value", i);
		$thing.text(languages[i])
		$("select").append($thing);
	}

	var socket = io.connect();

	socket.on('redirect', function(link) {
		var url = (window.location + link).replace("http://", "");
		$('.popup h4').html("You can now view your code at: <a href='" + link + "'>" + link + "</a>");
		$('.popup').show().animate({"opacity": 1});
		$('.main textarea, .main input').animate({"opacity": 0}, function() {
			$(this).css({"display": "none"});
		});
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

	$('input[type="button"]').click(function() {
		if ($(".main textarea").val() != "") {
			var data = {};
			data.code = $('.main textarea').val();
			data.lang = parseInt($("select").find(":selected").val());
			data.password = $('input[type="password"]').val();
			socket.emit('codeSubmit', data);
		}
		else {
			$('.main textarea').css({
				"color": "#e74c3c",
				"border-color": "#e74c3c"
			});
			setTimeout(function() {
				$('.main textarea').removeAttr('style');
			}, 1000);
		}
	});
});