import { jsx } from "react/jsx-runtime";
import { c } from "react/compiler-runtime";
import { useContext, useState, useEffect } from "react";
import { useObservable } from "react-rx";
import { ReleasesMetadataContext } from "sanity/_singletons";
import { useReleasesStore } from "./index2.js";
const DEFAULT_METADATA_STATE = {
  data: null,
  error: null,
  loading: !1
}, ReleasesMetadataProviderInner = (t0) => {
  const $ = c(15), {
    children
  } = t0;
  let t1;
  $[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel") ? (t1 = [], $[0] = t1) : t1 = $[0];
  const [listenerReleaseIds, setListenerReleaseIds] = useState(t1), {
    getMetadataStateForSlugs$
  } = useReleasesStore(), [releasesMetadata, setReleasesMetadata] = useState(null);
  let t2;
  $[1] !== getMetadataStateForSlugs$ || $[2] !== listenerReleaseIds ? (t2 = getMetadataStateForSlugs$(listenerReleaseIds.map(_temp)), $[1] = getMetadataStateForSlugs$, $[2] = listenerReleaseIds, $[3] = t2) : t2 = $[3];
  const observedResult = useObservable(t2) || DEFAULT_METADATA_STATE;
  let t3, t4;
  $[4] !== observedResult.data ? (t3 = () => setReleasesMetadata((prevReleaseMetadata) => observedResult.data ? {
    ...prevReleaseMetadata,
    ...observedResult.data
  } : prevReleaseMetadata), t4 = [observedResult.data], $[4] = observedResult.data, $[5] = t3, $[6] = t4) : (t3 = $[5], t4 = $[6]), useEffect(t3, t4);
  let t5;
  $[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel") ? (t5 = (addReleaseIds) => {
    setListenerReleaseIds((prevSlugs) => [...prevSlugs, ...addReleaseIds.filter(_temp2)]);
  }, $[7] = t5) : t5 = $[7];
  const addReleaseIdsToListener = t5;
  let t6;
  $[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel") ? (t6 = (releaseIds) => {
    setListenerReleaseIds((prevSlugs_0) => {
      const {
        nextSlugs
      } = prevSlugs_0.reduce((acc, slug_0) => {
        const {
          removedSlugs,
          nextSlugs: accNextSlugs
        } = acc;
        return releaseIds.includes(slug_0) && !removedSlugs.includes(slug_0) ? {
          removedSlugs: [...removedSlugs, slug_0],
          nextSlugs: accNextSlugs
        } : {
          removedSlugs,
          nextSlugs: [...accNextSlugs, slug_0]
        };
      }, {
        removedSlugs: [],
        nextSlugs: []
      });
      return nextSlugs;
    });
  }, $[8] = t6) : t6 = $[8];
  const removeReleaseIdsFromListener = t6;
  let t7;
  $[9] !== observedResult || $[10] !== releasesMetadata ? (t7 = {
    addReleaseIdsToListener,
    removeReleaseIdsFromListener,
    state: {
      ...observedResult,
      data: releasesMetadata
    }
  }, $[9] = observedResult, $[10] = releasesMetadata, $[11] = t7) : t7 = $[11];
  const context = t7;
  let t8;
  return $[12] !== children || $[13] !== context ? (t8 = /* @__PURE__ */ jsx(ReleasesMetadataContext.Provider, { value: context, children }), $[12] = children, $[13] = context, $[14] = t8) : t8 = $[14], t8;
}, ReleasesMetadataProvider = (t0) => {
  const $ = c(2), {
    children
  } = t0;
  if (useContext(ReleasesMetadataContext))
    return children;
  let t1;
  return $[0] !== children ? (t1 = /* @__PURE__ */ jsx(ReleasesMetadataProviderInner, { children }), $[0] = children, $[1] = t1) : t1 = $[1], t1;
}, useReleasesMetadataProvider = () => {
  const $ = c(2), contextValue = useContext(ReleasesMetadataContext);
  let t0;
  return $[0] !== contextValue ? (t0 = contextValue || {
    state: DEFAULT_METADATA_STATE,
    addReleaseIdsToListener: _temp3,
    removeReleaseIdsFromListener: _temp4
  }, $[0] = contextValue, $[1] = t0) : t0 = $[1], t0;
};
function _temp(slug) {
  return slug;
}
function _temp2(releaseId) {
  return typeof releaseId == "string";
}
function _temp3() {
  return null;
}
function _temp4() {
  return null;
}
export {
  ReleasesMetadataProvider,
  useReleasesMetadataProvider
};
//# sourceMappingURL=ReleasesMetadataProvider.js.map
