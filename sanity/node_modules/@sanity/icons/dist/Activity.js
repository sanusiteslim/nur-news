import { jsx } from "react/jsx-runtime";
/**
* @public
*/
function ActivityIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		"data-sanity-icon": "activity",
		width: "1em",
		height: "1em",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			d: "M21 15H19L15.5 7L11 18L8 12L6 15H4",
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		})
	});
}
export { ActivityIcon, ActivityIcon as default };

//# sourceMappingURL=Activity.js.map