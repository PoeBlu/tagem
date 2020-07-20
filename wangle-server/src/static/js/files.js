var $$$file_qry_url;
var $$$file_qry_url_paramsythings;
var $$$file_qry_post_data;
var $$$file_qry_page_n;

function $$$next_page(tbl_id,direction){
	switch(tbl_id){
		case 'f':
			$$$populate_f_table(null,null,null,$$$file_qry_page_n+direction);
			break;
	}
}

function $$$populate_f_table(path,params,post_data,page_n){
	$$$file_qry_page_n=parseInt(page_n);
	if((params!==null)&&(post_data!==null))
		return $$$alert("ERROR: At most one of (params, post_data) can be non-null");
	if(path!==null){
		$$$file_qry_url=path;
		$$$file_qry_url_paramsythings=params;
		$$$file_qry_post_data=post_data;
	}
	$$$ajax_data_w_JSON_response(
		($$$file_qry_post_data===null)?"GET":"POST",
		"!!!MACRO!!!SERVER_ROOT_URL/a/f/"+$$$file_qry_url+'/'+$$$file_qry_page_n+(($$$file_qry_url_paramsythings===null)?"":("/"+$$$file_qry_url_paramsythings)),
		$$$file_qry_post_data,
		function(datas){
			$$$get_file_ids = $$$get_selected_file_ids;
			let s = "";
			const [a,data,tags] = datas;
			if(a==="0"){
				if($$$dir_id==="0"){
					$$$alert("ERROR: Directory ID has not been set.");
				}
			}else{
				$$$dir_id=a;
			}
			for (let [thumb, id, name, title, sz, t_added_to_db, t_origin, duration, w, h, views, likes, dislikes, fps, ext_db_n_post_ids, tag_ids, era_start, era_end] of data){
				let era = "";
				if(era_end!==0){
					// era_end should be >= era_start, so era_end===0 implies era_start===0 too
					duration = era_end - era_start;
					era = "@" + era_start + "-" + era_end;
				}
				s += "<div class='tr' data-id='" + id + "' data-era='" + era + "'>";
					s += '<div class="td" onclick="$$$view_file(this.parentNode.dataset.id+this.parentNode.dataset.era)">';
						s += '<img class="thumb" src="' + thumb + '" onerror="$$$set_src_to_file_svg(this)"></img>';
					s += '</div>';
					//"s += "<td><a href='/d#" + ls[1] + "'>" + ls[2] + "</a></td>"; // Dir  ID and name
					s += "<div class='td fname'>" + $$$escape_html_text(name) + "</div>"; // File ID and name
					s += "<div class='td ftitle'>" + $$$escape_html_text(title) + "</div>";
					s += "<div class='td db'>" + ext_db_n_post_ids.replace(/:[0-9]+/,'') + "</div>"; // 3rd column i.e. col[2]
					// Ignore the post IDs that are sent alongside the DB IDs
					s += "<div class='td'>" + tag_ids + "</div>"; // 4th column i.e. col[3]
					s += "<div class='td' data-n=" + sz + ">" + $$$bytes2human(parseInt(sz)) + "</div>"; // 5th column i.e. col[4]
					s += "<div class='td' data-n=" + t_added_to_db + ">" + $$$timestamp2dt(t_added_to_db) + "</div>";
					s += "<div class='td' data-n=" + t_origin + ">" + $$$timestamp2dt(t_origin) + "</div>";
					s += "<div class='td' data-n=" + duration + ">" + $$$t2human(duration) + "</div>";
					s += "<div class='td w' data-n=" + w + ">" + w + "</div>";
					s += "<div class='td h' data-n=" + h + ">" + h + "</div>";
					s += "<div class='td views' data-n=" + views + ">" + $$$n2human(views) + "</div>";
					s += "<div class='td likes' data-n=" + likes + ">" + $$$n2human(likes) + "</div>";
					s += "<div class='td dislikes' data-n=" + dislikes + ">" + $$$n2human(dislikes) + "</div>";
					s += "<div class='td fps' data-n=" + fps + ">" + fps + "</div>";
					
				s += "</div>";
			}
			$$$set_node_visibility($$$document_getElementById('f').getElementsByClassName('next-page')[0], ($$$file_qry_page_n!==0));
			$$$set_node_visibility($$$document_getElementById('f').getElementsByClassName('next-page')[1], (data.length===$$$MAX_RESULTS_PER_PAGE));
			$$$get_tbl_body("f").innerHTML = s;
			$$$column_id2name('x', "f", '$$$view_db', 3);
			$$$column_id2name(tags,"f", '$$$view_tag', 4);
			
			$$$apply_thumbnail_width();
		}
	);
}

function $$$add_files_to_db(nodes){
	if($$$dir_id===0){
		$$$alert("Cannot add files to DB unless their directory ID is set");
		return;
	}
	if(nodes.length===0)
		return;
	$$$ajax_POST_data_w_JSON_response(
		"/f/record/"+$$$dir_id,
		nodes.map(x => '"'+x.getElementsByClassName('fname')[0].innerText.replace('"','\"')+'"').join(','),
		function(data){
			for(let node of nodes){
				node.dataset.id = data[node.getElementsByClassName('fname')[0].innerText];
			}
			$$$alert("Files newly registered.\nPlease now repeat your command.");
		}
	);
}

function $$$merge_files(){
	const master_file_ids = $$$split_on_commas_but_make_empty_if_empty($$$get_selected_file_ids());
	const dupl_file_ids   = $$$split_on_commas_but_make_empty_if_empty($$$get_selected2_file_ids());
	if(master_file_ids.length !== 1){
		$$$alert("There must be exactly one master file (use left mouse button to select them)");
		return;
	}
	if(dupl_file_ids.length === 0){
		$$$alert("No duplicate files selected (use middle mouse button to select them)");
		return;
	}
	const master_f_id = master_file_ids[0];
	if(dupl_file_ids.includes(master_f_id)){
		$$$alert("File cannot be selected as both master and duplicate");
		return;
	}
	$$$ajax_POST_w_text_response(
		"/f/merge/"+master_f_id+"/"+dupl_file_ids.join(","),
		function(){
			$$$deselect_rows('#f .tbody .tr', 1);
			$("#f .tbody .tr.selected2").remove();
		}
	);
}

function $$$get_selected2_file_ids(){
	return $("#f .tbody .tr.selected2").map((i, el) => el.dataset.id).get().join(",");
}
function $$$get_selected_file_ids(and_eras){
	let file_ids = "";
	let files_wo_ids = [];
	for(let node of $$$get_tbl_body('f').getElementsByClassName('selected1')){
		if(node.dataset.id==="0")
			files_wo_ids.push(node);
		else 
			file_ids += "," + node.dataset.id + ((and_eras===true)?node.dataset.era:"");
	}
	if(files_wo_ids.length!==0){
		$$$add_files_to_db(files_wo_ids);
		// Seems I can't simply wait for a promise and take the value; I'd have to transform every function relying on it
		return "";
	}
	return file_ids.substr(1);
}

function $$$after_tagged_selected_files(ids, tags){
	$$$after_tagged_selected_stuff('f',ids,tags,4);
}

function $$$view_files_by_value(var_name){
	$$$populate_f_table('$',var_name,null,0);
	$$$hide_all_except(['f','tagselect-files-container','tagselect-files-btn','merge-files-btn','backup-files-btn','view-as-playlist-btn']);
	$$$set_profile_name('Files assigned ' + var_name);
}

function $$$view_files(ls){
	$$$hide_all_except(['f','tagselect-files-container','tagselect-files-btn','merge-files-btn','backup-files-btn','view-as-playlist-btn']);
	
	$$$file_tagger_fn = $$$after_tagged_selected_files;
	$$$get_file_ids = $$$get_selected_file_ids;
	
	if (ls === undefined)
		$$$unset_window_location_hash();
	else{
		if (ls.length === 0){
			$$$get_tbl_body("f").innerHTML = "";
		}else{
			$$$populate_f_table('id',ls.join(","),null,0);
		}
	}
	
	$$$set_profile_name("Files");
}

function $$$toggle_file_add_backup_dialog(){
	$$$toggle('dirselect-container');
	$$$toggle('add-f-backup');
}
function $$$backup_files(){
	const file_ids = $$$get_file_ids(); // CSV string
	if(file_ids.length === ""){
		$$$alert("No files selected");
		return;
	}
	const _dir_id = $$$document_getElementById("dirselect").value;
	let url = $$$document_getElementById("add-f-backup-url").value;
	const is_ytdl = $$$document_getElementById("add-f-backup-ytdl").checked;
	if(_dir_id===""){
		$$$alert("No directory selected");
		return;
	}
	if(url !== ""){
		if((!url.startsWith('http')) && (!url.startsWith('/'))){
			$$$alert("Non-empty URL does not start with http or /");
			return;
		}
	}
	if(is_ytdl)
		url = "ytdl/" + url;
	$$$ajax_POST_w_text_response(
		"/f/backup/" + file_ids + "/" + _dir_id + "/" + url,
		function(){
			$$$hide('dirselect-container');
			$$$hide('add-f-backup');
		}
	);
}

function $$$add_files_dialog(){
	$$$document_getElementById('add-f-backup-toggle').checked = false;
	$$$hide_all_except(['tagselect-files-container','add-f-backup-toggle-container','add-f-dialog']);
	$$$hide('add-f-backup-url');
	// TODO: Toggle switch to allow selecting dir ID for backup
	$('#dirselect').val(null).trigger('change');
}