var languages = ['javascript', 'css', 'python', 'markup', 'java', 'php', 'coffescript', 'bash', 'c', 'cpp', 'ruby', 'swift', 'objectivec', 'haskell', 'go'];

$(document).ready(function() {
	$('pre').addClass("language-"+languages[lang]);
	setTimeout(function() {
		for (var i = 0; i < $('.line-highlight').length; i++) {
			var lineTop = $($('.line-highlight')[i]).position().top;
			$($('.line-highlight')[i]).css("top", lineTop+11);
		}
	}, 0);
	$(".btn[value='View Raw']").click(function() {
		base = String(window.location).split("/")[2];
		window.location = "http://raw."+base+"/"+link;
	});
	$(".btn[value='Copy']").clipboard({
		path: '/js/jquery.clipboard.swf',
		copy:function() {

			return $(".hiddenCode").text();
		}
	});
});