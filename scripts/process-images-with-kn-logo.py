#!/usr/bin/env python3
"""
Image Processing Script for Kano State Website
This script extracts the circular KN emblem from the Kano State logo
and creates professional composite images with the emblem as watermark/background
"""

import sys
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import urllib.request

# Configuration
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '../temp-kano-assets')
LOGO_URL = 'https://old.acresal.gov.ng/wp-content/uploads/2023/05/KANO.png'

print('🎨 KANO STATE IMAGE PROCESSING')
print('=' * 60)

def download_image(url, filename):
    """Download an image from URL"""
    filepath = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(filepath):
        print(f'✅ {filename} already exists')
        return filepath

    print(f'📥 Downloading {filename}...')
    urllib.request.urlretrieve(url, filepath)
    print(f'✅ Downloaded {filename}')
    return filepath

def extract_kn_circle(logo_path):
    """Extract the circular KN emblem from the full logo"""
    print('\n🔍 Extracting KN circle from logo...')

    # Open the logo
    logo = Image.open(logo_path).convert('RGBA')
    width, height = logo.size

    print(f'   Logo size: {width}x{height}')

    # The logo typically has the circular emblem on the left side
    # We'll crop to get just the circle (adjust coordinates as needed)
    # Assuming the circle is roughly in the left 40% of the image
    circle_width = int(height * 0.8)  # Circle is usually as wide as it is tall
    left = int(width * 0.05)  # Start from 5% from left
    top = int(height * 0.1)   # Start from 10% from top
    right = left + circle_width
    bottom = top + circle_width

    # Crop the emblem
    emblem = logo.crop((left, top, right, bottom))

    # Save the extracted emblem
    emblem_path = os.path.join(ASSETS_DIR, 'kn-emblem.png')
    emblem.save(emblem_path, 'PNG')

    print(f'✅ KN emblem extracted: {circle_width}x{circle_width}')
    print(f'   Saved to: kn-emblem.png')

    return emblem_path

def create_circular_mask(size):
    """Create a circular mask for images"""
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    return mask

def add_kn_watermark(image_path, emblem_path, output_suffix='_with_kn'):
    """Add KN emblem as a subtle watermark to an image"""
    print(f'\n🎨 Processing {os.path.basename(image_path)}...')

    # Open images
    img = Image.open(image_path).convert('RGBA')
    emblem = Image.open(emblem_path).convert('RGBA')

    img_width, img_height = img.size
    print(f'   Image size: {img_width}x{img_height}')

    # Resize emblem to be proportional (30% of image height)
    emblem_size = int(img_height * 0.3)
    emblem = emblem.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)

    # Make emblem semi-transparent for watermark effect
    emblem_watermark = emblem.copy()
    # Reduce opacity to 15% for subtle watermark
    alpha = emblem_watermark.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(0.15)
    emblem_watermark.putalpha(alpha)

    # Position watermark in bottom-right corner with margin
    margin = int(img_height * 0.05)
    position = (img_width - emblem_size - margin, img_height - emblem_size - margin)

    # Create composite
    result = img.copy()
    result.paste(emblem_watermark, position, emblem_watermark)

    # Save result
    filename = os.path.basename(image_path)
    name, ext = os.path.splitext(filename)
    output_path = os.path.join(ASSETS_DIR, f'{name}{output_suffix}{ext}')

    # Convert to RGB if saving as JPEG
    if ext.lower() in ['.jpg', '.jpeg']:
        result = result.convert('RGB')

    result.save(output_path, quality=95)

    print(f'✅ Created watermarked version: {name}{output_suffix}{ext}')
    return output_path

def create_kn_background_version(image_path, emblem_path):
    """Create version with large semi-transparent KN emblem as background"""
    print(f'\n🎨 Creating KN background version for {os.path.basename(image_path)}...')

    # Open images
    img = Image.open(image_path).convert('RGBA')
    emblem = Image.open(emblem_path).convert('RGBA')

    img_width, img_height = img.size

    # Create a white/light background
    background = Image.new('RGBA', (img_width, img_height), (255, 255, 255, 255))

    # Resize emblem to be large (70% of image size)
    emblem_size = int(min(img_width, img_height) * 0.7)
    emblem_bg = emblem.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)

    # Make it very transparent (5% opacity) for background effect
    alpha = emblem_bg.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(0.05)
    emblem_bg.putalpha(alpha)

    # Center the emblem
    emblem_x = (img_width - emblem_size) // 2
    emblem_y = (img_height - emblem_size) // 2

    # Composite: background + emblem + original image
    background.paste(emblem_bg, (emblem_x, emblem_y), emblem_bg)
    background.paste(img, (0, 0), img)

    # Save result
    filename = os.path.basename(image_path)
    name, ext = os.path.splitext(filename)
    output_path = os.path.join(ASSETS_DIR, f'{name}_kn_bg{ext}')

    if ext.lower() in ['.jpg', '.jpeg']:
        background = background.convert('RGB')

    background.save(output_path, quality=95)

    print(f'✅ Created KN background version: {name}_kn_bg{ext}')
    return output_path

def main():
    print(f'\n📁 Working directory: {ASSETS_DIR}\n')

    # Ensure assets directory exists
    os.makedirs(ASSETS_DIR, exist_ok=True)

    # Download and process logo
    logo_path = download_image(LOGO_URL, 'kano-logo-full.png')
    emblem_path = extract_kn_circle(logo_path)

    # Process all images in the assets directory
    images_to_process = [
        'gov-motorcycles.jpg',
        'gov-abu-1.jpg',
        'gov-uniform.jpg'
    ]

    print('\n' + '=' * 60)
    print('CREATING WATERMARKED VERSIONS')
    print('=' * 60)

    created_files = []

    for image_file in images_to_process:
        image_path = os.path.join(ASSETS_DIR, image_file)
        if os.path.exists(image_path):
            # Create watermark version
            watermark_path = add_kn_watermark(image_path, emblem_path)
            created_files.append(watermark_path)

            # Create background version for motorcycles image
            if 'motorcycles' in image_file.lower():
                bg_path = create_kn_background_version(image_path, emblem_path)
                created_files.append(bg_path)
        else:
            print(f'⚠️  {image_file} not found, skipping')

    print('\n' + '=' * 60)
    print('✅ IMAGE PROCESSING COMPLETE!')
    print('=' * 60)
    print(f'\n📸 Created {len(created_files)} processed images:')
    for f in created_files:
        print(f'   • {os.path.basename(f)}')

    print('\n💡 Next steps:')
    print('   1. Review the processed images in temp-kano-assets/')
    print('   2. Upload preferred versions to S3')
    print('   3. Update database with new S3 URLs\n')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
