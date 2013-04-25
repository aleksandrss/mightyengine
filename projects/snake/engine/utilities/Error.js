var mighty = window.mighty = {};

mighty.Error =
{
	init: function()
	{
		this.errorBox = document.getElementById("mightyError");
		this.errorLog = this.errorBox.getElementsByTagName("ul")[0];

		var self = this;
		window.onerror = function(message, file, lineNumber) {
			self.showErrorSilent(file + ": " + lineNumber, message);
		}
	},

	submit: function(title, msg) {
		this.showError(title, msg)
	},

	error: this.submit,

	warning: function(title, msg)
	{
		var strWarning = "";
		if(title && title.length)
		{
			if(msg && msg.length) {
				strWarning = "[" + title + "] - (Warning) " + msg;
			}
			else {
				strWarning = title;
			}
		}
		else {
			strWarning = msg;
		}

		console.error(strWarning);
	},

	showError: function(title, msg)
	{
		var strError = "";
		if(title && title.length)
		{
			if(msg && msg.length) {
				strError = "[" + title + "] - " + msg;
			}
			else {
				strError = title;
			}
		}
		else {
			strError = msg;
		}

		if(this.isShowErrorBox && this.errorLog) {
			var liElement = document.createElement("li");
			liElement.innerText = strError;
			this.errorLog.appendChild(liElement);
			this.errorBox.style.display = "block";
		}

		console.error(strError);
	},

	showErrorSilent: function(title, msg)
	{
		var strError = "";
		if(title && title.length)
		{
			if(msg && msg.length) {
				strError = "[" + title + "] - " + msg;
			}
			else {
				strError = title;
			}
		}
		else {
			strError = msg;
		}

		if(this.isShowErrorBox && this.errorLog) {
			var liElement = document.createElement("li");
			liElement.innerText = strError;
			this.errorLog.appendChild(liElement);
			this.errorBox.style.display = "block";
		}
	},

	//
	errorBox: null,
	errorLog: null,

	isShowErrorBox: true
};

mighty.Error.init();