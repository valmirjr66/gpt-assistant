import os
from pdf2image import convert_from_path
from PIL import Image


def generate_pdf_preview(
    pdf_path: str,
    output_path: str,
    canvas_width: int,
    canvas_height: int,
    background_color: tuple,
):
    # 1. Convert the first page of the PDF to an image
    pages = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=150)
    pdf_image = pages[0]  # Only need the first page

    # 2. Get the size of the PDF page image
    orig_width, orig_height = pdf_image.size

    # 3. Calculate the scale to maintain aspect ratio within the canvas
    width_ratio = canvas_width / orig_width
    height_ratio = canvas_height / orig_height
    scale = min(width_ratio, height_ratio)

    # 4. Compute the new size
    new_width = int(orig_width * scale)
    new_height = int(orig_height * scale)

    # 5. Resize the PDF image to the new size
    resized_image = pdf_image.resize((new_width, new_height))

    # 6. Create the background image (canvas)
    canvas = Image.new("RGB", (canvas_width, canvas_height), background_color)

    # 7. Paste the resized page onto the background (centered)
    offset_x = (canvas_width - new_width) // 2
    offset_y = (canvas_height - new_height) // 2
    canvas.paste(resized_image, (offset_x, offset_y))

    # 8. Save the resulting preview
    canvas.save(output_path)


def generate_previews_for_folder(
    folder_path: str,
    canvas_width: int,
    canvas_height: int,
    background_color=(255, 255, 255),
):
    # List all files in the folder
    for file_name in os.listdir(folder_path):
        # Check if it's a PDF
        if file_name.lower().endswith(".pdf"):
            pdf_path = os.path.join(folder_path, file_name)

            # Remove .pdf extension and create a preview file name
            base_name = os.path.splitext(file_name)[0]
            output_filename = f"{base_name}.preview.png"
            output_path = os.path.join(folder_path, output_filename)

            print(f"Generating preview for: {pdf_path} -> {output_path}")

            # Generate the preview
            generate_pdf_preview(
                pdf_path=pdf_path,
                output_path=output_path,
                canvas_width=canvas_width,
                canvas_height=canvas_height,
                background_color=background_color,
            )


if __name__ == "__main__":
    folder_to_process = "../storage"

    generate_previews_for_folder(
        folder_path=folder_to_process,
        canvas_width=1920,
        canvas_height=1080,
        background_color=(0, 0, 0),
    )
