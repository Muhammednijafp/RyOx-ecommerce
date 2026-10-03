import bpy
import os


# ============================================================
# RYOX CINEMATIC RENDER
# FILE 2 — HIGH QUALITY RENDER SETTINGS
# ============================================================


# ------------------------------------------------------------
# LOCATIONS
# ------------------------------------------------------------

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "output"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


BLEND_FILE = os.path.join(
    OUTPUT_DIR,
    "ryox_cinematic_scene.blend"
)


RENDER_DIR = os.path.join(
    OUTPUT_DIR,
    "frames"
)

os.makedirs(
    RENDER_DIR,
    exist_ok=True
)


# ------------------------------------------------------------
# OPEN CREATED BLENDER SCENE
# ------------------------------------------------------------

if not os.path.exists(BLEND_FILE):

    raise FileNotFoundError(
        "\nRYOX Blender scene was not found.\n\n"
        f"Expected:\n{BLEND_FILE}\n\n"
        "Run create_ryox_scene.py first."
    )


bpy.ops.wm.open_mainfile(
    filepath=BLEND_FILE
)


scene = bpy.context.scene


# ------------------------------------------------------------
# ANIMATION SETTINGS
# ------------------------------------------------------------

scene.frame_start = 1
scene.frame_end = 300

scene.render.fps = 30


# ------------------------------------------------------------
# HIGH RESOLUTION
# ------------------------------------------------------------

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080

scene.render.resolution_percentage = 100


# ------------------------------------------------------------
# RENDER ENGINE
# ------------------------------------------------------------

scene.render.engine = "BLENDER_EEVEE"


# ------------------------------------------------------------
# HIGH QUALITY SETTINGS
# ------------------------------------------------------------

scene.render.image_settings.file_format = "PNG"

scene.render.image_settings.color_mode = "RGBA"

scene.render.film_transparent = False


# ------------------------------------------------------------
# MOTION BLUR
# ------------------------------------------------------------

scene.render.use_file_extension = True


# ------------------------------------------------------------
# OUTPUT PATH
# ------------------------------------------------------------

scene.render.filepath = os.path.join(
    RENDER_DIR,
    "ryox_"
)


# ------------------------------------------------------------
# COLOR MANAGEMENT
# ------------------------------------------------------------

scene.view_settings.look = "AgX - Medium High Contrast"


# ------------------------------------------------------------
# FRAME RANGE
# ------------------------------------------------------------

print("")
print("==============================================")
print("          RYOX CINEMATIC RENDER")
print("==============================================")
print("")

print("Resolution : 1920 x 1080")
print("FPS        : 30")
print("Frames     : 300")
print("Duration   : 10 seconds")
print("Engine     : Blender Eevee")
print("")

print("Output:")
print(RENDER_DIR)

print("")
print("Rendering started...")
print("")


# ------------------------------------------------------------
# RENDER ANIMATION
# ------------------------------------------------------------

bpy.ops.render.render(
    animation=True
)


print("")
print("==============================================")
print("       RYOX RENDER COMPLETED")
print("==============================================")
print("")
print("Frames saved to:")
print(RENDER_DIR)
print("")
print("Next step:")
print("Convert the rendered frames into")
print("a web-optimized RYOX MP4.")
print("==============================================")