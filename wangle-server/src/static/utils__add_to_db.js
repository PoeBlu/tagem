"function obj_type2parent_type(obj_type){"
	"switch(obj_type){"
		"case 'f':"
			"return 'd';"
		"case 'd':"
			"return 'D';"
		"case 'D':"
			"return 'P';"
	"}"
"}"

"function nickname2name(obj_type){"
	"switch(obj_type){"
		"case 'f':"
			"return 'file';"
		"case 'd':"
			"return 'dir';"
		"case 'D':"
			"return 'device';"
		"case 'P':"
			"return 'protocol';"
	"}"
"}"

"function nickname2fullname(obj_type){"
	"switch(obj_type){"
		"case 'f':"
			"return 'file';"
		"case 'd':"
			"return 'directory';"
		"case 'D':"
			"return 'device';"
		"case 'P':"
			"return 'protocol';"
	"}"
"}"

"function add_to_db(obj_type){"
	"const queue = document.getElementById('add-'+obj_type+'-queue');"
	
	"if(obj_type==='t'){"
		"const tag_names = [];"
		"queue.innerText.replace(/(?:^|\\n)([^\\n]+)/g, function(group0, group1){"
			"tag_names.push(group1);"
		"});"
		"if(tag_names.length===0)"
			"return;"
		"const tagselect = $('#tagselect-self-p');"
		"const parent_ids = tagselect.val();"
		"if(parent_ids.length === 0)"
			"return;"
		"$.ajax({"
			"type:\"POST\","
			"url:\"/t/add/\" + parent_ids.join(\",\") + \"/\","
			// The trailing slash is to make it slightly easier for the server
			"data:tag_names.join(\"\\n\"),"
			"success:function(){"
				"tagselect.val(\"\").change();"
				"queue.innerHTML = \"\";" // Remove URLs
				"alert(\"Success\");"
				"refetch_json('t', '/a/t.json');"
			"},"
			"dataType:\"text\""
		"});"
		"return;"
	"}"
	
	"const urls = [];"
	"queue.innerText.replace(/(?:^|\\n)([0-9]+)[\\s]+([^\\n]+)/g, function(group0, group1, group2){"
		"urls.push([group1, group2]);"
	"});"
	"if(urls.length===0){"
		"alert(\"No URLs\");"
		"return;"
	"}"
	"let tagselect;"
	"let tag_ids;"
	"if(obj_type==='f'){"
		// TODO: Allow tagging of directories and devices
		"tagselect = $('#tagselect-files');"
		"tag_ids = tagselect.val();"
		"if(tag_ids.length === 0){"
			// TODO: Replace with confirmation dialog
			"alert(\"No tags\");"
			"return;"
		"}"
	"}"
	
	"const parent_type = obj_type2parent_type(obj_type);"
	"for(const [_parent_id, url] of urls){"
		"const parent_name = window[parent_type][parseInt(_parent_id)][0];"
		"if(!url.startsWith(parent_name)){"
			"const parent_type_name = nickname2fullname(parent_type);"
			"const err_txt = nickname2fullname(obj_type) + \" URL does not begin with assigned \" + parent_type_name + \"\\nURL: \" + url + \"\\n\" + parent_type_name + \": \" + parent_name;"
			"if(obj_type !== 'd'){"
				"alert(err_txt);"
				"return;"
			"}"
			"if(!confirm(err_txt + \"\\nContinue?\")){"
				"return;"
			"}"
		"}"
	"}"
	"$.ajax({"
		"type:\"POST\","
		"url:\"/\" + obj_type + \"/add/\" + ((obj_type==='f')?tag_ids.join(\",\")+\"/\":\"\")," // Trailing slash is for server's convenience
		"data:urls.map(([parent,url]) => parent+'\\t'+url).join('\\n'),"
		"success:function(){"
			"if(obj_type==='f')"
				"tagselect.val(\"\").change();"
			"queue.innerHTML = \"\";" // Remove URLs
			"alert(\"Success\");"
		"},"
		"error:err_alert,"
		"dataType:\"text\""
	"});"
"}"

"function add_to_db__append(obj_type){"
	"const inp = document.getElementById('add-' + obj_type + '-input');"
	"const x = inp.value;"
	"if(x === \"\"){"
		"alert(\"Enter a tag or URL\");"
		"return;"
	"}"
	
	"if(obj_type==='t'){"
		"document.getElementById('add-' + obj_type + '-queue').innerText += \"\\n\" + inp.value;"
	"}else{"
		"const parent_type = obj_type2parent_type(obj_type);"
		"const parent_select_id = nickname2name(parent_type) + \"select\";"
		"let parent_id = document.getElementById(parent_select_id).value;"
		
		"if((parent_id === \"\") || (!x.startsWith(window[parent_type][parent_id][0]))){"
			// Guess the directory
			"const tpl = guess_parenty_thing_from_name(parent_type, x);"
			"if(tpl === undefined){"
				"const parent_type_name = nickname2fullname(parent_type);"
				"alert(\"Cannot find suitable \" + parent_type_name + \"\\nPlease create a \" + parent_type_name + \" object that is a prefix of the \" + nickname2fullname(obj_type) + \" URL\");"
				"return;"
			"}"
			"parent_id = tpl[0];"
			"$('#' + parent_select_id).val(parent_id).trigger('change');"
		"}"
		"document.getElementById('add-' + obj_type + '-queue').innerText += \"\\n\" + parent_id + \"\\t\" + inp.value;"
	"}"
	"inp.value = \"\";"
"}"
