"use strict";

function LoaderIncludes()
{
	var loader = mighty.Loader;

	// Engine
	loader.rootPath = "engine/";
	loader.include("EngineUtils.js");
	loader.include("Palette.js");

	// Math
	loader.include("math/Functions.js");
	loader.include("math/AABB.js");
	loader.include("math/Vector2.js");
	loader.include("math/Vector4.js");
	loader.include("math/Matrix3.js");
	loader.include("math/Sphere.js");
	loader.include("math/Random.js");
	loader.include("math/DrawAABB.js");

	// Utilities
	loader.include("utilities/BinaryHeap.js");
	loader.include("utilities/ByteBuffer.js");
	loader.include("utilities/DepthList.js");
	loader.include("utilities/PriorityList.js");

	loader.include("profiler/Profiler.js");

	// ---- PLUGINS
	loader.path = "plugins/";

	// Plugin
	loader.include("Plugin/Plugin.js");
	loader.include("Plugin/Module.js");
	loader.include("Plugin/Timer.js");

	// Component
	loader.include("Component/ComponentManager.js");
	loader.include("Component/Basic.js");

	// Entity
	loader.include("Entity/EntityManager.js");
	loader.include("Entity/Entity.js");
	loader.include("Entity/EntityLite.js");
	loader.include("Entity/EntityLiteGrid.js");

	// Template
	loader.include("Template/TemplateManager.js");
	loader.include("Template/Template.js");

	// Resource
	loader.include("Resource/ResourceManager.js");
	loader.include("Resource/Resource.js");
	loader.include("Resource/ResourceModule.js");
	loader.include("Resource/texture/TextureHandler.js");
	loader.include("Resource/texture/TextureResource.js");
	loader.include("Resource/texture/AnimTextureResource.js");
	loader.include("Resource/sound/SoundHandler.js");
	loader.include("Resource/sound/SoundResource.js");

	// Material
	loader.include("Material/MaterialManager.js");
	loader.include("Material/Basic.js");
	loader.include("Material/Color.js");
	loader.include("Material/Grayscale.js");

	// Input
	loader.include("Input/Input.js");

	// Patch
	loader.include("Patch/PatchManager.js");
	loader.include("Patch/Patch.js");
	loader.include("Patch/PatchIsometric.js");
	loader.include("Patch/PatchTopDown.js");
	loader.include("Patch/Grid.js");

	// Scene
	loader.include("Scene/SceneState.js");
	loader.include("Scene/SceneManager.js");
	loader.include("Scene/Scene.js");

	// Brush
	loader.include("Brush/BrushManager.js");
	loader.include("Brush/BrushEvent.js");
	loader.include("Brush/Brush.js");
	loader.include("Brush/Stage.js");
	loader.include("Brush/BrushEntity.js");
	loader.include("Brush/BrushTile.js");

	// Entity
	loader.include("Entity/EntityLoader.js");
	loader.include("Entity/EntityGeometry.js");

	// Cursor
	loader.include("Cursor/Cursor.js");

	// Terrain
	loader.include("Terrain/TerrainLoader.js");
	loader.include("Terrain/TerrainSelector.js");
	loader.include("Terrain/TerrainManager.js");

	// Editor
	loader.include("Editor/Editor.js");
	loader.include("Editor/addon/terrain/TerrainEditor.js");
	loader.include("Editor/addon/entity/EntityEditor.js");

	// Camera
	loader.include("Camera/Camera.js");

	loader.include("Map/Map.js");

	loader.include("i18n/i18n.js");

	// ----- ADDONS
	loader.path = "";

	loader.include("Macros.js");


	loader.rootPath = "";
}

LoaderIncludes();
