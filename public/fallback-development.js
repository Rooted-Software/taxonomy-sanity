/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@ducanh2912/next-pwa/dist/fallback.js":
/*!************************************************************!*\
  !*** ./node_modules/@ducanh2912/next-pwa/dist/fallback.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n\nself.fallback = async (e)=>{\n    switch(e.destination){\n        case \"document\":\n            return  true ? caches.match(\"/~offline\", {\n                ignoreSearch: !0\n            }) : 0;\n        case \"image\":\n            return  true ? caches.match(\"/static/images/fallback.png\", {\n                ignoreSearch: !0\n            }) : 0;\n        case \"audio\":\n            return  false ? 0 : Response.error();\n        case \"video\":\n            return  false ? 0 : Response.error();\n        case \"font\":\n            return  false ? 0 : Response.error();\n        case \"\":\n            return  false ? 0 : Response.error();\n        default:\n            return Response.error();\n    }\n};\n\n\n//# sourceURL=webpack://taxonomy-sanity/./node_modules/@ducanh2912/next-pwa/dist/fallback.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./node_modules/@ducanh2912/next-pwa/dist/fallback.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;