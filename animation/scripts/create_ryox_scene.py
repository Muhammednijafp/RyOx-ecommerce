import bpy
import math
import os
from mathutils import Vector


# ============================================================
# RYOX CINEMATIC 360° PRODUCT CAMERA
# FILE 1 — SCENE GENERATOR
# ============================================================

# ------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------

FPS = 30
DURATION_SECONDS = 10
TOTAL_FRAMES = FPS * DURATION_SECONDS

CAMERA_RADIUS = 7.0
CAMERA_HEIGHT = 0.4

LOGO_WIDTH = 5.0
LOGO_HEIGHT = 5.0
LOGO_DEPTH = 0.18

# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

LOGO_PATH = os.path.join(
    BASE_DIR,
    "logo",
    "ryox-logo.png"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "output"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ------------------------------------------------------------
# CLEAR EXISTING SCENE
# ------------------------------------------------------------

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

for datablocks in (
    bpy.data.meshes,
    bpy.data.curves,
    bpy.data.materials,
    bpy.data.cameras,
    bpy.data.lights,
):
    pass


# ------------------------------------------------------------
# WORLD / BACKGROUND
# ------------------------------------------------------------

world = bpy.context.scene.world

if world is None:
    world = bpy.data.worlds.new("RYOX World")
    bpy.context.scene.world = world

world.use_nodes = True

world_nodes = world.node_tree.nodes
background = world_nodes.get("Background")

if background:
    background.inputs["Color"].default_value = (
        0.001,
        0.001,
        0.001,
        1
    )

    background.inputs["Strength"].default_value = 0.08


# ------------------------------------------------------------
# RYOX LOGO PANEL
# ------------------------------------------------------------

bpy.ops.mesh.primitive_cube_add(
    location=(0, 0, 0)
)

logo_panel = bpy.context.object
logo_panel.name = "RYOX_3D_Logo_Panel"

logo_panel.scale = (
    LOGO_WIDTH / 2,
    LOGO_DEPTH / 2,
    LOGO_HEIGHT / 2
)

bpy.ops.object.transform_apply(
    location=False,
    rotation=False,
    scale=True
)


# ------------------------------------------------------------
# PANEL BEVEL
# ------------------------------------------------------------

bevel = logo_panel.modifiers.new(
    name="Luxury_Bevel",
    type="BEVEL"
)

bevel.width = 0.08
bevel.segments = 6

bpy.context.view_layer.objects.active = logo_panel

bpy.ops.object.modifier_apply(
    modifier=bevel.name
)


# ------------------------------------------------------------
# BLACK LUXURY MATERIAL
# ------------------------------------------------------------

panel_material = bpy.data.materials.new(
    name="RYOX_Black_Luxury"
)

panel_material.use_nodes = True

nodes = panel_material.node_tree.nodes
bsdf = nodes.get("Principled BSDF")

if bsdf:

    bsdf.inputs["Base Color"].default_value = (
        0.003,
        0.003,
        0.003,
        1
    )

    bsdf.inputs["Metallic"].default_value = 0.75

    bsdf.inputs["Roughness"].default_value = 0.22


logo_panel.data.materials.append(panel_material)


# ------------------------------------------------------------
# LOGO IMAGE PLANE
# ------------------------------------------------------------

if not os.path.exists(LOGO_PATH):

    raise FileNotFoundError(
        f"\nRYOX logo not found:\n{LOGO_PATH}\n\n"
        "Put your logo image inside animation/logo/"
    )


bpy.ops.mesh.primitive_plane_add(
    size=2,
    location=(0, -LOGO_DEPTH / 2 - 0.005, 0),
    rotation=(math.radians(90), 0, 0)
)

logo_image = bpy.context.object
logo_image.name = "RYOX_Logo_Image"


logo_image.scale = (
    LOGO_WIDTH / 2.05,
    LOGO_HEIGHT / 2.05,
    1
)

bpy.ops.object.transform_apply(
    location=False,
    rotation=False,
    scale=True
)


# ------------------------------------------------------------
# LOGO MATERIAL
# ------------------------------------------------------------

logo_material = bpy.data.materials.new(
    name="RYOX_Gold_Logo"
)

logo_material.use_nodes = True

nodes = logo_material.node_tree.nodes
links = logo_material.node_tree.links

for node in list(nodes):
    nodes.remove(node)


output = nodes.new(
    "ShaderNodeOutputMaterial"
)

principled = nodes.new(
    "ShaderNodeBsdfPrincipled"
)

image_texture = nodes.new(
    "ShaderNodeTexImage"
)


# Load logo image

logo_image_data = bpy.data.images.load(
    LOGO_PATH,
    check_existing=True
)

image_texture.image = logo_image_data


# Metallic gold appearance

principled.inputs["Metallic"].default_value = 0.85
principled.inputs["Roughness"].default_value = 0.18

principled.inputs["Base Color"].default_value = (
    1.0,
    0.55,
    0.03,
    1
)

principled.inputs["Emission Color"].default_value = (
    0.15,
    0.04,
    0.005,
    1
)

principled.inputs["Emission Strength"].default_value = 0.15


links.new(
    image_texture.outputs["Color"],
    principled.inputs["Base Color"]
)

links.new(
    image_texture.outputs["Alpha"],
    principled.inputs["Alpha"]
)

links.new(
    principled.outputs["BSDF"],
    output.inputs["Surface"]
)


logo_image.data.materials.append(
    logo_material
)


# ------------------------------------------------------------
# LOGO DEPTH
# ------------------------------------------------------------

solidify = logo_image.modifiers.new(
    name="Logo_Depth",
    type="SOLIDIFY"
)

solidify.thickness = 0.035

bevel_logo = logo_image.modifiers.new(
    name="Logo_Bevel",
    type="BEVEL"
)

bevel_logo.width = 0.015
bevel_logo.segments = 3


# ------------------------------------------------------------
# CAMERA
# ------------------------------------------------------------

camera_data = bpy.data.cameras.new(
    "RYOX_Cinematic_Camera"
)

camera = bpy.data.objects.new(
    "RYOX_Cinematic_Camera",
    camera_data
)

bpy.context.collection.objects.link(camera)

bpy.context.scene.camera = camera

camera.data.lens = 52

camera.data.sensor_width = 36


# ------------------------------------------------------------
# CAMERA TRACK TARGET
# ------------------------------------------------------------

bpy.ops.object.empty_add(
    type="PLAIN_AXES",
    location=(0, 0, 0)
)

camera_target = bpy.context.object

camera_target.name = "RYOX_Camera_Target"


# ------------------------------------------------------------
# CAMERA TRACKING
# ------------------------------------------------------------

track = camera.constraints.new(
    type="TRACK_TO"
)

track.target = camera_target

track.track_axis = "TRACK_NEGATIVE_Z"

track.up_axis = "UP_Y"


# ------------------------------------------------------------
# 360° ROBOTIC CAMERA MOVEMENT
# ------------------------------------------------------------

scene = bpy.context.scene

scene.frame_start = 1
scene.frame_end = TOTAL_FRAMES

scene.render.fps = FPS


for frame in range(1, TOTAL_FRAMES + 1):

    progress = (frame - 1) / (TOTAL_FRAMES - 1)

    angle = math.radians(
        progress * 360
    )

    # Robotic camera orbit

    x = math.cos(angle) * CAMERA_RADIUS
    y = math.sin(angle) * CAMERA_RADIUS

    # Subtle vertical robotic movement

    z = CAMERA_HEIGHT + (
        math.sin(angle * 2) * 0.12
    )

    camera.location = (
        x,
        y,
        z
    )

    camera.keyframe_insert(
        data_path="location",
        frame=frame
    )


# ------------------------------------------------------------
# SMOOTH CAMERA ANIMATION
# ------------------------------------------------------------
if camera.animation_data:

    action = camera.animation_data.action

    if action:

        # Blender 5.2 uses animation layers/slots.
        # Set interpolation through the action's fcurves
        # when available.

        if hasattr(action, "fcurves"):

            for fcurve in action.fcurves:

                for keyframe in fcurve.keyframe_points:

                    keyframe.interpolation = "BEZIER"

# ------------------------------------------------------------
# KEY LIGHT
# ------------------------------------------------------------

def create_area_light(
    name,
    location,
    energy,
    size
):

    light_data = bpy.data.lights.new(
        name=name,
        type="AREA"
    )

    light_data.energy = energy
    light_data.shape = "DISK"
    light_data.size = size

    light = bpy.data.objects.new(
        name,
        light_data
    )

    bpy.context.collection.objects.link(
        light
    )

    light.location = location

    constraint = light.constraints.new(
        type="TRACK_TO"
    )

    constraint.target = camera_target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"

    return light


# ------------------------------------------------------------
# CINEMATIC LIGHTING
# ------------------------------------------------------------

create_area_light(
    "RYOX_Key_Light",
    (4, -4, 4),
    1100,
    4
)

create_area_light(
    "RYOX_Rim_Light",
    (-4, 2, 3),
    900,
    3
)

create_area_light(
    "RYOX_Top_Light",
    (0, 0, 5),
    700,
    3
)


# ------------------------------------------------------------
# FLOOR
# ------------------------------------------------------------

bpy.ops.mesh.primitive_plane_add(
    size=40,
    location=(0, 0, -2.6)
)

floor = bpy.context.object

floor.name = "RYOX_Black_Studio_Floor"

floor_material = bpy.data.materials.new(
    name="RYOX_Studio_Floor"
)

floor_material.use_nodes = True

floor_bsdf = floor_material.node_tree.nodes.get(
    "Principled BSDF"
)

if floor_bsdf:

    floor_bsdf.inputs["Base Color"].default_value = (
        0.002,
        0.002,
        0.002,
        1
    )

    floor_bsdf.inputs["Metallic"].default_value = 0.25

    floor_bsdf.inputs["Roughness"].default_value = 0.3


floor.data.materials.append(
    floor_material
)


# ------------------------------------------------------------
# RENDER SETTINGS
# ------------------------------------------------------------

scene.render.engine = "BLENDER_EEVEE"

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080

scene.render.resolution_percentage = 100

scene.render.image_settings.file_format = "PNG"


# ------------------------------------------------------------
# COLOR MANAGEMENT
# ------------------------------------------------------------

scene.view_settings.look = "AgX - Medium High Contrast"


# ------------------------------------------------------------
# SAVE BLENDER PROJECT
# ------------------------------------------------------------

blend_file = os.path.join(
    OUTPUT_DIR,
    "ryox_cinematic_scene.blend"
)

bpy.ops.wm.save_as_mainfile(
    filepath=blend_file
)


print("")
print("==========================================")
print("        RYOX SCENE CREATED SUCCESSFULLY")
print("==========================================")
print("")
print("Logo:")
print(LOGO_PATH)
print("")
print("Blender scene:")
print(blend_file)
print("")
print("Camera:")
print("360 degree robotic orbit")
print("")
print(f"Frames: {TOTAL_FRAMES}")
print(f"FPS: {FPS}")
print(f"Duration: {DURATION_SECONDS} seconds")
print("")
print("Next step: cinematic rendering")
print("==========================================")