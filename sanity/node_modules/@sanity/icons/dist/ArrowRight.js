import { jsx, jsxs } from "react/jsx-runtime";
/**
* @public
*/
function ArrowRightIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		"data-sanity-icon": "arrow-right",
		width: "1em",
		height: "1em",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: [/* @__PURE__ */ jsx("path", {
			d: "M19.5 12.5H5",
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		}), /* @__PURE__ */ jsx("path", {
			d: "M14 7L19.5 12.5L14 18",
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		})]
	});
}
export { ArrowRightIcon, ArrowRightIcon as default };

//# sourceMappingURL=ArrowRight.js.map