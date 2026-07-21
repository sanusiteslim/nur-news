import { jsx } from "react/jsx-runtime";
/**
* @public
*/
function CropIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		"data-sanity-icon": "crop",
		width: "1em",
		height: "1em",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			d: "M9.5 5V15.5H20M5 9.5H15.5V20",
			stroke: "currentColor",
			strokeWidth: 1.2,
			strokeLinejoin: "round"
		})
	});
}
export { CropIcon, CropIcon as default };

//# sourceMappingURL=Crop.js.map