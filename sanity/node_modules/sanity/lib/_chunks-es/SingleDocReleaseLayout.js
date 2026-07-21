import { jsx } from "react/jsx-runtime";
import { c } from "react/compiler-runtime";
import { SingleDocReleaseEnabledProvider, SingleDocReleaseUpsellProvider } from "./index2.js";
function SingleDocReleaseLayout(props) {
  const $ = c(4);
  let t0;
  $[0] !== props ? (t0 = props.renderDefault(props), $[0] = props, $[1] = t0) : t0 = $[1];
  let t1;
  return $[2] !== t0 ? (t1 = /* @__PURE__ */ jsx(SingleDocReleaseEnabledProvider, { children: /* @__PURE__ */ jsx(SingleDocReleaseUpsellProvider, { children: t0 }) }), $[2] = t0, $[3] = t1) : t1 = $[3], t1;
}
export {
  SingleDocReleaseLayout
};
//# sourceMappingURL=SingleDocReleaseLayout.js.map
