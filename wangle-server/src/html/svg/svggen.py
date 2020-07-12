#!/usr/bin/env python3


import re


def parse_lines(text_only:bool, text_too:bool, ls:list):
	lines:iter = (line for line in ls)
	license:str = ""
	icons:dict = {}
	for line in lines:
		if line == "" or line.startswith("//"):
			continue
		m = re.search("^([A-Z0-9_]+):([^\n]+)$", line)
		if m is not None:
			icon_name:str = m.group(1)
			icon:str = ""
			while True:
				line = next(lines)
				if line == "":
					break
				if not text_only:
					icon += re.sub(' (?:xmlns|class|width|height)="[^"]*"','',re.sub("^[\s]*", "", line)).replace(" />", "/>")
			if text_only or text_too:
				icon += m.group(2)
			icons[icon_name] = '"' + license + icon.replace("\\","\\\\").replace('"','\\"') + '"'
			continue
		if license == "":
			license = "<!--The following icon is subject to the following license:"
			while True:
				line = next(lines)
				if line == "":
					break
				license += "\\n" + line.replace('"', '\\"')
			license += "-->"
			continue
	return icons


if __name__ == "__main__":
	import argparse
	import os
	
	parser = argparse.ArgumentParser()
	parser.add_argument("dst", help="C++ header file destination path")
	parser.add_argument("srcs", nargs="+", help="Source file")
	parser.add_argument("--text-only", default=False, action="store_true", help="Use text labels only")
	parser.add_argument("--text-too", default=False, action="store_true", help="Place text alongside labels")
	args = parser.parse_args()
	
	if os.path.isfile(args.dst) and os.path.getmtime(args.dst) > max([os.path.getmtime(fp) for fp in args.srcs]):
		# Already generated
		exit(0)
	
	with open(args.dst, "w") as f:
		for fp in args.srcs:
			for key, value in parse_lines(args.text_only, args.text_too, open(fp).read().split("\n")).items():
				f.write(f"#define SVG_{key} {value}\n")
