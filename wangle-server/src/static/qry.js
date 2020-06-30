function $$$init_qry(){
	$$$document_getElementById("qry").addEventListener("keyup", function(e){
		e.preventDefault();
		if (e.keyCode === 13){ // Enter
			const qry_str = this.value + " ";
			$.post({
				url: "/q/",
				data:qry_str,
				dataType: "json",
				success: function(data){
					switch(qry_str[0]){
						case 'f': $$$view_files(data); break;
						case 'd': $$$view_dirs(data.map(x => x.toString()));  break;
						case 't': $$$view_tags(data.map(x => x.toString()));  break;
					}
				},
				error: function(){
					alert("Query error (incorrect syntax?)");
					$$$unhide("qry-help");
				}
			});
		}
	});
}
