/*
Copyright 2020 Adam Gray
This file is part of the tagem program.
The tagem program is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License as published by the
Free Software Foundation version 3 of the License.
The tagem program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
This copyright notice should be included in any copy or substantial copy of the tagem source code.
The absense of this copyright notices on some other files in this project does not indicate that those files do not also fall under this license, unless they have a different license written at the top of the file.
*/
#pragma once

namespace protocol {
	enum {
		NONE,
		local_filesystem,
		http,
		https,
		youtube_dl,
		COUNT
	};
	constexpr static
	const char* const strings[COUNT] = {
		"NONE",
		"file://",
		"http://",
		"https://",
		"youtube-dl"
	};
}
