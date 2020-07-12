function $$$obj_type2parent_type(obj_type){
	switch(obj_type){
		case 'f':
			return 'd';
		case 'd':
			return 'D';
		case 'D':
			return 'P';
	}
}

function $$$nickname2name(obj_type){
	switch(obj_type){
		case 'f':
			return 'file';
		case 'd':
			return 'dir';
		case 'D':
			return 'device';
		case 'P':
			return 'protocol';
	}
}

function $$$nickname2fullname(obj_type){
	switch(obj_type){
		case 'f':
			return 'file';
		case 'd':
			return 'directory';
		case 'D':
			return 'device';
		case 'P':
			return 'protocol';
	}
}

function $$$add_to_db(obj_type){
	const queue = $$$document_getElementById('add-'+obj_type+'-queue');
	const parent_type = $$$obj_type2parent_type(obj_type);
	
	if(obj_type==='t'){
		const tag_names = [];
		queue.innerText.replace(/(?:^|\n)([^\n]+)/g, function(group0, group1){
			tag_names.push(group1);
		});
		if(tag_names.length===0)
			return;
		const tagselect = $('#tagselect-self-p');
		const parent_ids = tagselect.val();
		if(parent_ids.length === 0)
			return;
		$$$ajax_POST_data_w_text_response("/t/add/"+parent_ids.join(",")+"/", tag_names.join("\n"), function(){
			tagselect.val("").change();
			queue.innerHTML = ""; // Remove URLs
			$$$alert("Success");
		});
		return;
	}
	
	let urls;
	const lists_parents = (obj_type==='D');
	if(lists_parents){
		urls = [];
		queue.textContent.replace(/(?:^|\n)URL:[\s]*([^\n]+)\nParent:[\s]*\[([\d]+)\][\s]*([^\s][^\n]+)/g, function(group0, url, parent_id, parent_name){
			const _parent_id = Object.entries($$$window[parent_type]).filter(([key,[name,_]]) => name==parent_name)[0][0];
			if(_parent_id != parent_id){
				$$$alert("Mismatching IDs detected");
				return;
			}
			urls.push([parent_id, parent_name, url]);
		});
	}else{
		urls = [...queue.textContent.matchAll(/[^\n]+/g)];
	}
	if(urls.length===0){
		$$$alert("No URLs");
		return;
	}
	let tagselect;
	let tag_ids;
	if(['f','d','D'].includes(obj_type)){
		// TODO: Allow tagging of directories and devices
		tagselect = $('#tagselect-files');
		tag_ids = tagselect.val();
		if(tag_ids.length === 0){
			// TODO: Replace with confirmation dialog
			$$$alert("No tags");
			return;
		}
	}
	
	if(lists_parents){
	for(const [_parent_id, parent_name, url] of urls){
		if(!url.startsWith(parent_name)){
			const parent_type_name = $$$nickname2fullname(parent_type);
			const err_txt = $$$nickname2fullname(obj_type) + " URL does not begin with assigned " + parent_type_name + "\nURL: " + url + "\n" + parent_type_name + ": " + parent_name;
			if(obj_type !== 'd'){
				$$$alert(err_txt);
				return;
			}
			if(!confirm(err_txt + "\nContinue?")){
				return;
			}
		}
	}
	}
	if(lists_parents)
		urls = urls.map(([parent,parent_name,url]) => parent+'\t'+url);
	$$$ajax_POST_data_w_text_response(
		"/" + obj_type + "/add/" + tag_ids.join(",")+"/",
		urls.join("\n"),
		function(){
			tagselect.val("").change();
			queue.innerHTML = ""; // Remove URLs
			$$$alert("Success");
			if((obj_type!=='f')&&(obj_type!=='d'))
				$$$refetch_json(obj_type, '/a/'+obj_type+'.json');
		}
	);
}

function $$$append_nontag_line_to__add_to_db__section(obj_type, value){
	$$$document_getElementById('add-' + obj_type + '-queue').textContent += value + "\n";
}

function $$$append_nontag_line_to__add_to_db__section_parented(obj_type, value, parent_id, parent_name){
	$$$append_nontag_line_to__add_to_db__section(obj_type,  "\nURL:    " + value + "\nParent: [" + parent_id + "] " + parent_name);
}

function $$$add_to_db__append(obj_type){
	const inp = $$$document_getElementById('add-' + obj_type + '-input');
	const x = inp.value;
	if(x === ""){
		$$$alert("Enter a tag or URL");
		return;
	}
	const parent_type = $$$obj_type2parent_type(obj_type);
	
	if(['t','f','t'].includes(obj_type)){
		$$$document_getElementById('add-' + obj_type + '-queue').innerText += "\n" + x;
	}else{
		const parent_select_id = $$$nickname2name(parent_type) + "select";
		const parent = $('#'+parent_select_id).select2('data')[0];
		let parent_name;
		let parent_id;
		if(parent === undefined){
			const tpl = $$$guess_parenty_thing_from_name(parent_type, x);
			if(tpl === undefined){
				const parent_type_name = $$$nickname2fullname(parent_type);
				$$$alert("Cannot find suitable " + parent_type_name + "\nPlease create a " + parent_type_name + " object that is a prefix of the " + $$$nickname2fullname(obj_type) + " URL");
				return;
			}
			parent_id = tpl[0];
			parent_name = tpl[1];
		} else {
			parent_id = parent.id;
			parent_name = parent.text;
		}
		if(obj_type==='D')
			$$$append_nontag_line_to__add_to_db__section_parented(obj_type, x, data[0][0], data[0][1]);
		else
			$$$append_nontag_line_to__add_to_db__section(obj_type, x);
	}
	inp.value = "";
}
