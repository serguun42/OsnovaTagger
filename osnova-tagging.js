// ==UserScript==
// @name         Osnova Users Tagging
// @version      1.14.2
// @icon         https://tjournal.ru/static/build/tjournal.ru/favicons/favicon.ico
// @match        https://tjournal.ru/*
// @match        https://dtf.ru/*
// @match        https://vc.ru/*
// @grant        none
// @license      MIT
// @author       gro-ove x serguun42
// @updateURL    https://serguun42.ru/tampermonkey/osnova-tagging/osnova-tagging.js
// @downloadURL  https://serguun42.ru/tampermonkey/osnova-tagging/osnova-tagging.js
// @description  Tagging users with custom labels
// ==/UserScript==



/**
 * @param {String} iKey
 * @returns {Promise.<HTMLElement>}
 */
const GlobalWaitForElement = iKey => {
	if (iKey === "document.body") {
		if (document.body) return Promise.resolve(document.body);

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.body) {
					clearInterval(interval);
					resolve(document.body);
				};
			}, 50);
		});
	} else {
		if (document.querySelector(iKey)) return Promise.resolve(document.querySelector(iKey));

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.querySelector(iKey)) {
					clearInterval(interval);
					resolve(document.querySelector(iKey));
				};
			}, 50);
		});
	};
};

/**
 * @param {String} userId
 */
const SetTag = userId => {
	let tags = JSON.parse(localStorage.userTags || "{}"),
		oldColor = `#${(tags[userId] ? tags[userId].split("#")[1] : null) || "818181"}`,
		newTag = prompt("Тег или ТЕГ#ЦВЕТ_В_ФОРМАТЕ_HEX:", tags[userId] || "");

	if (newTag === null || newTag === undefined) return;

	localStorage.userTags = JSON.stringify(Object.assign(tags, { [userId]: newTag }), (k, v) => v ? v : undefined);
	UpdateTags();

	if (newTag && newTag.indexOf("#") === -1) {
		with (document.body.appendChild(document.createElement("input"))) {
			type = "color";
			style.display = "none";
			value = oldColor;
			onchange = (e) => {
				localStorage.userTags = JSON.stringify(Object.assign(tags, { [userId]: newTag + e.currentTarget.value }), (k, v) => v ? v : undefined);
				UpdateTags();
				document.body.removeChild(e.currentTarget);
			};
			click();
		};
	};
};

const LaunchAddingTagButtonProcedure = () => {
	let lastURL = "";

	const LocalInterval = () => {
		if (lastURL === window.location.pathname) return;
		lastURL = window.location.pathname;


		if (!(/^\/u\/\d+\-/g.test(window.location.pathname))) return;

		GlobalWaitForElement(`.etc_control[data-subsite-url]`).then((target) => {
			let userTag = JSON.parse(localStorage.userTags || "{}")[/^\/u\/(\d+)-/.test(window.location.pathname) && RegExp.$1];

			let customButton = document.createElement("div");
				customButton.addEventListener("click", () => /^\/u\/(\d+)-/.test(window.location.pathname) && SetTag(RegExp.$1));
				customButton.className = "s42-custom-tag ui-button ui-button--5 l-ml-12 lm-ml-0 lm-mr-12";
				customButton.innerHTML = userTag ? `<span>${userTag.split("#")[0]}</span>` : "<span>Тег</span>";

			if (document.querySelector(".s42-custom-tag")) return false;

			target.insertAdjacentElement("afterend", customButton);
		});
	};

	setInterval(LocalInterval, 250);
};

/**
 * Converts HEX to RGB. Returns Array
 * 
 * @param {String} iHEX 
 * @returns {[Number, Number, Number]}
 */
const HEXtoRGBArray=iHEX=>iHEX.slice(iHEX[0]=="#").length==3?[parseInt(iHEX.slice(iHEX[0]=="#")[0]+iHEX.slice(iHEX[0]=="#")[0],16),parseInt(iHEX.slice(iHEX[0]=="#")[1]+iHEX.slice(iHEX[0]=="#")[1],16),parseInt(iHEX.slice(iHEX[0]=="#")[2]+iHEX.slice(iHEX[0]=="#")[2],16)]:(iHEX.slice(iHEX[0]=="#").length==6?[parseInt(iHEX.slice(iHEX[0]=="#")[0]+iHEX.slice(iHEX[0]=="#")[1],16),parseInt(iHEX.slice(iHEX[0]=="#")[2]+iHEX.slice(iHEX[0]=="#")[3],16),parseInt(iHEX.slice(iHEX[0]=="#")[4]+iHEX.slice(iHEX[0]=="#")[5],16)]:[0,0,0]);

/**
 * Is the color dark?
 * 
 * @param {[Number, Number, Number]} iRGB - Array of red, green, and blue
 * @return {Boolean}
 */
const IsDarkRGB = iRGB => ((iRGB[0] * 299 + iRGB[1] * 587 + iRGB[2] * 114) / 1000) < 128;

/**
 * Is the color dark?
 * 
 * @param {String} iHEX - HEX representation of color
 * @return {Boolean}
 */
const IsDarkHEX = iHEX => IsDarkRGB(HEXtoRGBArray(iHEX || "#818181"));

const UpdateTags = () => {
	let tags = JSON.parse(localStorage.userTags || "{}");
	TAGS_STYLES.innerHTML = Object.keys(tags).filter(key => tags[key]).map(key =>
		`a[href*="/${key}-"] .user_name:after,.vote__users__item[href*="/${key}-"] .vote__users__item__name:after,.content-header-author[href*="/${key}-"]:after{content:"${tags[key].split("#")[0]}";background:#${tags[key].split("#")[1] || "818181"} !important;color:#${IsDarkHEX(tags[key].split("#")[1]) ? "FFFFFF" : "000000"} !important;}.etc_control[data-subsite-url*="/${key}-"]~.s42-custom-tag{background:#${tags[key].split("#")[1] || "818181"} !important;border-color:#${tags[key].split("#")[1] || "818181"} !important;color:#${IsDarkHEX(tags[key].split("#")[1]) ? "FFFFFF" : "000000"} !important;}`
	).join("\n");
};




with (document.head.appendChild(document.createElement("style"))) {
	innerHTML = `
	.comments__item__self--major.comments__item__self--author .comments__item__user__name .user_name, .comments__item__self--major.comments__item__self--special .comments__item__user__name .user_name {
		padding: 2px 5px;
	}

	.user_name:after, .content-header-author:after, .vote__users__item .vote__users__item__name:after {
		display: inline-block;
		position: relative;
		font-family: Roboto, sans-sefir;
		font-size: small;
		font-weight: normal;
		padding: 2px 4px;
		box-sizing: border-box;
		margin: -3px -5px -3px 4px;
		border-radius: 2px;
		vertical-align: 0;
	}

	.vote__users__item .vote__users__item__name:after {
		padding: 0 4px 0 4px;
		margin: -2px 4px -3px 4px;
	}

	.etc_control[data-subsite-url] + .s42-custom-tag {
		height: 34px;
		line-height: 34px;
		font-size: 15px;
		padding: 0 20px;
		border-radius: 4px;
		display: inline-block;
		font-weight: normal;
		margin-left: 8px;
		cursor: pointer;
	}`;
};

const TAGS_STYLES = document.head.appendChild(document.createElement("style"));



GlobalWaitForElement("document.body").then(() => {
	LaunchAddingTagButtonProcedure();
	UpdateTags();
});