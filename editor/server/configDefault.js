this.config = {
	port: 8080,
	host: null, // host or IP
	
	demoMode: false,
	openBrowser: true,
	
	useSymlinks: true,
	useBuildInWatcher: true,
	watcherPollingTime: 1000,
	
	//do not change
	webRoot: ["../client", "../../projects"],
	
	mimes: {
		"html": "text/html",
		"js": "text/javascript",
		"avi": "video/avi",
		"css": "text/css",
		"zip": "application/zip",
		"mighty": "application/mighty"
	},
	
	
	defaultProjectTemplate: "default",
	newProjectTemplates: "projectTemplates",
	tmpPath: "tmp",
	projectPath: "../../projects",
	projectExtension: "mighty",
	
	//project paths - relative to project
	deployPath: "assets/deploy",
	releasePath: "release",
	assetsPath: "assets",
	
	editorPath: ".editor",
	enginePath: "engine",
	pluginsPath: "src/plugins",
	addonsPath: "src/addons",
	deployScriptsPath: "src/hooks",
	
	//engine path stuff - relative to engine
	engineSrcPath: "../../engine",
	enginePluginsPath: "plugins",
	
	engineDevMode: false,
	
	//almost hardcoded stuff
	noEmptyValue:["Map"],
	
	pluginType: "Plugin",
	addonType: "Addon"
};
