import { jsx } from "react/jsx-runtime";
/**
* @public
*/
function RemoveIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		"data-sanity-icon": "remove",
		width: "1em",
		height: "1em",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			d: "M5 12.5H20",
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		})
	});
}
export { RemoveIcon, RemoveIcon as default };

//# sourceMappingURL=Remove.js.map