var Y=Object.defineProperty,Z=Object.defineProperties;var x=Object.getOwnPropertyDescriptors;var _=Object.getOwnPropertySymbols;var ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable;var z=(e,t,r)=>t in e?Y(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,K=(e,t)=>{for(var r in t||(t={}))ee.call(t,r)&&z(e,r,t[r]);if(_)for(var r of _(t))te.call(t,r)&&z(e,r,t[r]);return e},V=(e,t)=>Z(e,x(t));const re=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerpolicy&&(i.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?i.credentials="include":o.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}};re();function ne(){return{}}function E(e,t,r=1){e[t]||(e[t]=0),e[t]+=r}function oe(e,t,r=1){E(e,t,r*-1)}function N(e){return Object.keys(M(e)).sort().reduce((t,r)=>{const n=e[r],o=n?n===1?r:`${r}^${n}`:"";return`${t}${o}`},"")}function ie(e){return Object.keys(e).length===0}function ue(...e){const t={};return e.forEach(r=>{Object.keys(r).forEach(n=>{E(t,n,r[n])})}),M(t)}function ae(e,t){const r=JSON.parse(JSON.stringify(e));return Object.keys(t).forEach(n=>{oe(r,n,t[n])}),r}function M(e){const t=JSON.parse(JSON.stringify(e));return Object.keys(t).forEach(r=>{t[r]>0||delete t[r]}),t}function $(e,t){return{type:"fraction",data:{numerator:e,denominator:t}}}function se(e){if(!e.includes("|"))throw new Error("Could not parse text as fraction : the input string does not contain a '|'. Valid example: '12 | 5'");const t=e.indexOf("|"),r=e.slice(0,t),n=e.slice(t+1);if(n.indexOf("|")!==-1)throw new Error("Could not parse text as fraction : the input string contains multiplie bars.");const o=s(r),i=s(n);if(!m(o)||!m(i))throw new Error("Could not parse text as fraction : could not parse numerator and/or denominator as number.");return $(o,i)}function le(e){const t={numerator:l(e.data.numerator),denominator:l(e.data.denominator)};return`${t.numerator?"(":""}${c(e.data.numerator)}${t.numerator?")":""}|${t.denominator?"(":""}${c(e.data.denominator)}${t.denominator?")":""}`}function R(e){if(!e)return!1;const t=typeof e=="object"?y(e):e;return!(!t.includes("|")||t.indexOf("|")!==t.lastIndexOf("|")||!m(t.slice(0,t.indexOf("|")))||!m(t.slice(t.indexOf("|")+1)))}function j(e){let{numerator:t,denominator:r}=e.data;if(c(t)===c(r))return s("1");if(l(t)||l(r)||(R(t)&&(t=j(t)),R(r)&&(r=j(r)),!m(t)||!m(r)))return $(t,r);const n=ae(t.data.multiplier,r.data.multiplier),o=M(n),i=JSON.parse(JSON.stringify(n));console.log("deno multi"),console.log(n),Object.keys(i).forEach(k=>{const A=i[k];A>=0&&delete i[k],A<0&&(i[k]*=-1)}),console.log(i);const u=(k,A)=>k%A==0;if(u(t.data.value,r.data.value)&&Object.keys(i).length===0){const k=t.data.value/r.data.value;return s(`${k}${N(o)}`)}let a=1;const g=()=>a=1;let h=t.data.value,T=r.data.value;for(;a<=h&&a<=T&&a<=1e5;)a++,u(h,a)&&u(T,a)&&(h/=a,T/=a,g());return{type:"fraction",data:{numerator:s(`${h}${N(o)}`),denominator:s(`${T}${N(i)}`)}}}const f={sum:{priority:0,symbol:"+",operation:(e,t)=>{const r=[...O(e),...O(t)],n={};r.forEach(i=>{if(P(i)){const a=N(i.data.multiplier);n[a]||(n[a]=0),n[a]+=i.data.value;return}const u=c(i);n[u]||(n[u]=0),n[u]++}),console.log("Summing up terms");const o=Object.keys(n).sort((i,u)=>i.length<u.length?1:i.length>u.length?-1:0).map(i=>{const u=n[i];let a;if(u===0)return null;e:if(/[\+\-\*\/|]/.test(i)){const g=H(i);if(console.log(`Key%c${i}%c contains operators.`,"color: skyblue"),u===1){a=g;break e}a={left:s(u.toString()),operator:s("*"),right:V(K({},g),{impossible:!0})}}else console.log(`Key %c${i}%c does not contain operators.`,"color: skyblue"),a=s(`${u}${i}`);return[a,s("+")]}).flat(100).filter(i=>i!==null);return o.pop(),console.log(o),S(o,{markAsImpossible:!0})}},difference:{priority:0,symbol:"-",operation:(e,t)=>f.sum.operation(e,Q(t))},product:{priority:1,symbol:"*",operation:(e,t)=>{const r=O(e),n=O(t),o=r.map(i=>n.map(u=>{let a;e:if(!l(i)&&!l(u)){if(P(i)&&P(u)){a={type:"number",data:{value:i.data.value*u.data.value,multiplier:ue(i.data.multiplier,u.data.multiplier)}};break e}const g=J(i)?C(i):$(C(i),s("1")),h=J(u)?C(u):$(C(u),s("1"));console.log("Multiplying fractions"),console.log(g),console.log(h),a=j($(f.product.operation(g.data.numerator,h.data.numerator),f.product.operation(g.data.denominator,h.data.denominator))),console.log(a)}else a={left:i,right:u,operator:s("*"),impossible:!0};return[a,s("+")]})).flat(100);return o.pop(),f.sum.operation(S(o),s("0"))}},quotient:{priority:1,symbol:"/",operation:(e,t)=>$(C(e),C(t))},power:{priority:2,symbol:"^",operation:(e,t)=>{const r={a:!l(e),b:!l(t)};if(r.a&&r.b){const n=e,o=t;if(w(n)&&w(o)){const i=Math.pow(n.data.value,o.data.value);return{type:"number",data:{value:i,multiplier:{}}}}if(w(o)){const i=JSON.parse(JSON.stringify(n));return E(i.data.multiplier,N(B(y(n))),o.data.value-1),i}}e:if(r.b&&w(t)){const o=t.data.value;if(o>50)break e;let i=[];for(let u=0;u<o;u++)i.push(C(e)),i.push(s("*"));return i.pop(),S(i)}return{left:e,operator:s("^"),right:t,impossible:!0}}},fraction:{priority:1,symbol:"|",operation:(e,t)=>$(e,t)}};function b(e,t){const r=e&&typeof e=="object"?y(e):e;if(!r||r.length!==1)return!1;const n=F(r);return n===null?!1:(t==null?void 0:t.priority)===void 0||t.priority===f[n].priority}function F(e){var r;return(r=Object.keys(f).find(n=>f[n].symbol===e))!=null?r:null}function ce(e){const t=F(e);return t===null?null:f[t]}function fe(e){var r;const t=(r=Object.keys(f).find(n=>f[n].symbol===e))!=null?r:null;return f[t].priority}function I(e){return`${f[e.data.name].symbol}`}function p(e,t={includeOpenings:!0,includeClosings:!0}){const r=e&&typeof e=="object"?y(e):e||"";return!r||r.length!==1?!1:t.includeOpenings!==!1&&r==="("||t.includeOpenings!==!1&&r==="["||t.includeClosings!==!1&&r===")"||t.includeClosings!==!1&&r==="]"}function de(e){return e.data.type==="parenthesis"&&e.data.direction==="opening"?"(":e.data.type==="parenthesis"&&e.data.direction==="closing"?"]":e.data.type==="bracket"&&e.data.direction==="opening"?"[":e.data.type==="bracket"&&e.data.direction==="closing"?"]":""}function s(e){if(p(e))return{type:"parenthesis",data:{direction:p(e,{includeClosings:!1})?"opening":"closing",type:e==="("||e===")"?"parenthesis":"bracket"}};if(b(e))return{type:"operator",data:{name:F(e),priority:fe(e)}};if(m(e))return{type:"number",data:{value:pe(e)||0,multiplier:B(e)||{}}};if(R(e))return se(e);throw new Error(`The text '${e}' could not be recognized as a term.`)}function y(e){if(e.type==="number")return ge(e);if(e.type==="operator")return I(e);if(e.type==="parenthesis")return de(e);if(e.type==="fraction")return le(e);throw new Error("Can't stringify term of an unknown type.")}function m(e){if(!e)return!1;const t=typeof e=="object"?y(e):e;return/^(-?[0-9]*(\.?[0-9]+)?([a-z](\^[0-9]+)?)*){1}$/g.test(t)}function D(e){if(!e)return!1;const t=typeof e=="object"?y(e):e;return/^-?[0-9]+\.?[0-9]*$/g.test(t)}function v(e){if(!e)return!1;const t=typeof e=="object"?y(e):e;return/^-?[a-z]$/g.test(t)}function pe(e){if(!m(e))return null;let t="";for(let r=0;r<e.length;r++){const n=e.charAt(r);if(v(n))break;t+=n}return t===""?1:t==="-"?-1:parseFloat(t)}function B(e){if(!m(e))return null;const t=ne();let r="";for(let n=0;n<e.length;n++){const o=e.charAt(n);v(o)&&(e.charAt(n+1)==="^"?(E(t,o,parseFloat(e.charAt(n+2))),n+=2):E(t,o))}for(let n=0;n<r.length;n++){const o=r.charAt(n);E(t,o)}return t}function ge(e){let t=e.data.value.toString();t==="1"&&(t=""),t==="-1"&&(t="-");const r=N(e.data.multiplier),n=`${t}${r}`;return n===""?"1":n}function L(e,t){for(let r=e.length-1;r>0;r--){const n=e[r];if(!Array.isArray(n)&&!l(n)&&b(y(n),{priority:t==null?void 0:t.priority}))return r}return null}function he(e){return e.replace(/\s+/g,"")}function ye(e){const t=[],r=u=>{u&&t.push(u)};let n="";const o=u=>{u&&(n+=u)},i=()=>{n!==""&&(t.push(n),n="")};for(let u=0;u<e.length;u++){const a=e.charAt(u);if(a!==" "){if(b(a)||p(a)){if(u===0&&(a==="+"||a==="-")){o(a);continue}i(),r(a);continue}else if(v(a)){if(u===1&&(n==="-"||n==="+")){o(a),i();continue}o(a);continue}o(a)}}return i(),t}function me(e){let t=e;return t=$e(t),t=be(t),t=we(t),t}function be(e){var r;const t=[];for(let n=0;n<e.length;n++){const o=(r=e[n-1])!=null?r:null,i=e[n];(o&&!b(o)&&!p(o,{includeClosings:!1})&&p(i,{includeClosings:!1})||D(o)&&v(i)||v(o)&&v(i))&&t.push("*"),t.push(i)}return t}function $e(e){const t=[],r=()=>{var n;return(n=t[t.length-1])!=null?n:null};for(let n=0;n<e.length;n++){const o=e[n];p(r(),{includeClosings:!1})&&p(o,{includeOpenings:!1})?t.pop():t.push(o)}return t}function we(e){const t=Array.from(e);if(e.length<2)return t;e:if(b(t[0],{priority:0})){if(p(t[1])){t.unshift("0");break e}if(m(t[1])){t[1]=`${t[0]}${t[1]}`,t.splice(0,1);break e}}return t}function Oe(e){return S(G(ke(e)))}function ke(e){return e.map(r=>s(r))}function G(e){const t=[];let r=[],n=0;for(let o=0;o<e.length;o++){const i=e[o];if(n!==0&&r.push(i),p(y(i),{includeClosings:!1}))n++,n===1&&r.push(i);else if(p(y(i),{includeOpenings:!1})&&(n--,n===0)){t.push(G(r.slice(1,-1))),r=[];continue}n===0&&t.push(i)}return t.map(o=>Array.isArray(o)&&o.length===1?o[0]:o)}function S(e,t){var g,h;if(e.length===0)return s("0");if(e.length===1)return Array.isArray(e[0])?S(e[0]):e[0];let n=(()=>({2:L(e,{priority:2}),1:L(e,{priority:1}),0:L(e,{priority:0})}))();const o=(h=(g=n[0])!=null?g:n[1])!=null?h:n[2],i=e.slice(0,o),u=e[o],a=e.slice(o+1);if(!i||!a)throw new Error("Could not structure misconstructed expression.");return{left:S(i,t),operator:u,right:S(a,t),impossible:(t==null?void 0:t.markAsImpossible)||!1}}function ve(e){return/^[0-9\.a-z\+\-\*\/\(\)\^\[\]|]+$/g.test(e)}function Se(e){let t=0;for(let r=0;r<e.length;r++){const n=e[r];if(p(n,{includeClosings:!1}))t++;else if(p(n,{includeOpenings:!1})&&(t--,t<0))return!1}return t===0}function Ce(e){var n;const t=e[0],r=e[e.length-1];if(b(t)||b(r))return!1;for(let o=0;o<e.length;o++){const i=(n=e[o-1])!=null?n:null,u=e[o];if(b(u)&&(i?b(i):!0)||D(u)&&(i?v(i):!1))return!1}return!0}function H(e){const t=he(e);if(console.log(t),!ve(t))throw console.error(`The expression '${e}' could not be parsed because it contains unsupported characters.`),new Error("Unsupported characters.");const r=ye(t);console.log(r);const n=me(r);if(!Se(n))throw console.error(`The expression '${e}' could not be parsed because of a parentheses error.`),new Error("Parentheses error.");if(!Ce(n))throw console.error(`The expression '${e}' could not be parsed because of an order error.`),new Error("Ordering error.");return console.log(n),Oe(n)}function C(e){return JSON.parse(JSON.stringify(e))}function w(e){const t=o=>P(o)?r(o):n(o),r=o=>ie(o.data.multiplier),n=o=>w(o.data.numerator)&&w(o.data.denominator);return l(e)?(l(e.left)?w(e.left):t(e.left))&&(l(e.right)?w(e.right):t(e.right)):t(e)}function c(e){if(console.log(JSON.stringify(e,null,4)),!l(e))return y(e);const t={left:l(e.left),right:l(e.right)},r={left:t.left?e.left.operator.data.priority:null,thisOperation:e.operator.data.priority,right:t.right?e.right.operator.data.priority:null},n={left:r.left===null?!1:r.left<r.thisOperation,right:r.right===null?!1:r.right<r.thisOperation};let o="";return o+=`${n.left?"(":""}${c(e.left)}${n.left?")":""}`,o+=` ${I(e.operator)} `,o+=`${n.right?"(":""}${c(e.right)}${n.right?")":""}`,o}function U(e){let t=JSON.parse(JSON.stringify(e));console.groupCollapsed("%cReduction step","color: limegreen; font-size: 1.2rem");let r="";for(;q(t);){const n=t,o=U(n.left);console.log(I(n.operator));const i=U(n.right);if(r=c(t),t=ce(I(n.operator)).operation(o,i),r===c(t))break}return J(t)&&(console.log(`Simplifying fraction : %c${c(t)}`,"color: hotpink"),t=j(t)),console.log("Result : %c"+c(t),"color: skyblue"),console.groupEnd(),t}function O(e){return l(e)?e.operator.data.name==="sum"?[...O(e.left),...O(e.right)]:e.operator.data.name==="difference"?[...O(e.left),...O(Q(e.right))]:[e]:[e]}function Q(e){return f.product.operation(JSON.parse(JSON.stringify(e)),s("-1"))}function l(e){return e.hasOwnProperty("operator")}function P(e){return!l(e)&&!J(e)}function J(e){var r;return!!((r=e.data)==null?void 0:r.hasOwnProperty("numerator"))}function q(e){return l(e)?!!(e.impossible!==!0||q(e.left)||q(e.right)):!1}const d={def:{function:document.querySelector("#function-def"),a:document.querySelector("#a-def")},result:{p:document.querySelector(".result__paragraph"),issue:document.querySelector(".result__issue"),copy:document.querySelector(".result__copy"),copyAnswer:document.querySelector(".result__copy-answer"),links:document.querySelector(".result__links")},compute:document.querySelector("#compute")};function W(){const e=d.def.function.textContent||"",t=(r,n=35)=>r.length<=n?r:r.slice(0,n)+"...";try{const r=H(e);console.groupCollapsed("%cParsed","color: orange; font-size: 1.2rem"),console.log(r),console.log(c(r)),console.groupEnd();const n=U(r);console.group("%cReduced","color: yellow; font-size: 1.2rem"),console.log(n),console.log(c(n)),console.groupEnd();const o=`Unexpected result when reducing: '${t(e)}'`,i=`${o}

Input: '${e}'
Current output: ${c(n)}
Expected output: please complete here`;d.result.p.textContent=`${e} = ${c(n)}`,d.result.issue.href=`https://github.com/martinheywang/literal-calculator-web/issues/new?title=${encodeURIComponent(o)}&body=${encodeURIComponent(i)}`,d.result.copyAnswer.style.display="unset",d.result.copyAnswer.onclick=()=>navigator.clipboard.writeText(c(n))}catch(r){const n=r.message,o=`Error when reducing: '${t(e)}'`,i=`${o}

Input: '${e}'
Message: "${n}"`;d.result.p.textContent=`Error: "${n}"`,d.result.issue.href=`https://github.com/martinheywang/literal-calculator-web/issues/new?title=${encodeURIComponent(o)}&body=${encodeURIComponent(i)}`,d.result.copyAnswer.style.display="",console.log(r)}d.result.links.style.display="flex"}d.compute.addEventListener("click",W);const Ee=new URLSearchParams(location.search),X=decodeURIComponent(Ee.get("expression")||"");X&&(d.def.function.textContent=X,W());d.result.copy.addEventListener("click",Ne);function Ne(){const e=`${location.origin}${location.pathname}?expression=${encodeURIComponent(d.def.function.textContent||"")}`;navigator.clipboard.writeText(e)}