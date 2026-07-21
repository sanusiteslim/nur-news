import { jsx } from "react/jsx-runtime";
import { c } from "react/compiler-runtime";
import { ScheduledPublishingEnabledProvider, useScheduledPublishingEnabled, SchedulePublishingUpsellProvider } from "./index2.js";
function SchedulePublishingStudioLayoutInner(props) {
  const $ = c(6), {
    enabled,
    mode
  } = useScheduledPublishingEnabled();
  if (!enabled) {
    let t02;
    return $[0] !== props ? (t02 = props.renderDefault(props), $[0] = props, $[1] = t02) : t02 = $[1], t02;
  }
  let t0;
  $[2] !== props ? (t0 = props.renderDefault(props), $[2] = props, $[3] = t0) : t0 = $[3];
  const children = t0;
  if (mode === "upsell") {
    let t1;
    return $[4] !== children ? (t1 = /* @__PURE__ */ jsx(SchedulePublishingUpsellProvider, { children }), $[4] = children, $[5] = t1) : t1 = $[5], t1;
  }
  return children;
}
function SchedulePublishingStudioLayout(props) {
  const $ = c(2);
  let t0;
  return $[0] !== props ? (t0 = /* @__PURE__ */ jsx(ScheduledPublishingEnabledProvider, { children: /* @__PURE__ */ jsx(SchedulePublishingStudioLayoutInner, { ...props }) }), $[0] = props, $[1] = t0) : t0 = $[1], t0;
}
export {
  SchedulePublishingStudioLayout
};
//# sourceMappingURL=SchedulePublishingStudioLayout.js.map
