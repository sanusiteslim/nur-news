import { jsx } from "react/jsx-runtime";
/**
* @public
*/
function SquareIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		"data-sanity-icon": "square",
		width: "1em",
		height: "1em",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx("rect", {
			x: 5.5,
			y: 5.5,
			width: 14,
			height: 14,
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		})
	});
}
export { SquareIcon, SquareIcon as default };

//# sourceMappingURL=Square.js.map