"function init_qry(){"
	"document.getElementById(\"qry\").addEventListener(\"keyup\", function(e){"
		"e.preventDefault();"
		"if (e.keyCode === 13){" // Enter
			"const qry = this.value;"
			"$.post({"
				"url: \"/q/\" + qry,"
				"dataType: \"json\","
				"success: function(r){"
					"const data = JSON.parse(r);"
					"switch(qry[0]){"
						"case 'f': view_files(data); break;"
						"case 'd': view_dirs(data);  break;"
						"case 't': view_tags(data); break;"
					"}"
				"},"
				"error: function(){"
					"alert(\"Query error (incorrect syntax?)\");"
				"}"
			"});"
		"}"
	"});"
"}"
