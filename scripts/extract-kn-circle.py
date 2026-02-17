#!/usr/bin/env python3
"""
Extract the circular KN emblem from Kano State logo
Removes background and creates a clean transparent PNG of just the circle
"""

import os
import urllib.request
from PIL import Image, ImageDraw

# Configuration
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '../temp-kano-assets')
LOGO_URL = 'https://old.acresal.gov.ng/wp-content/uploads/2023/05/KANO.png'

print('🎨 EXTRACTING KN CIRCLE FROM KANO STATE LOGO')
print('=' * 60)

def download_logo():
    """Download the Kano State logo"""
    os.makedirs(ASSETS_DIR, exist_ok=True)
    filepath = os.path.join(ASSETS_DIR, 'kano-logo-original.png')

    if os.path.exists(filepath):
        print('✅ Logo already downloaded')
        return filepath

    print('📥 Downloading logo from official source...')
    urllib.request.urlretrieve(LOGO_URL, filepath)
    print('✅ Logo downloaded')
    return filepath

def extract_kn_circle(logo_path):
    """Extract just the circular KN emblem with transparent background"""
    print('\n🔍 Opening logo...')

    # Open logo
    logo = Image.open(logo_path)

    # Convert to RGBA if not already
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')

    width, height = logo.size
    print(f'   Original size: {width}x{height}')

    # The KN circle is typically on the left side of the logo
    # Let's extract it by cropping the left portion
    # Adjust these values based on the actual logo layout

    # Estimate circle position (usually left side, roughly square)
    circle_size = int(height * 0.85)  # Circle is about 85% of height
    left = int(width * 0.02)  # Small margin from left
    top = int(height * 0.08)  # Small margin from top
    right = left + circle_size
    bottom = top + circle_size

    # Crop to get the circle area
    circle_area = logo.crop((left, top, right, bottom))

    print(f'   Cropped circle area: {circle_size}x{circle_size}')

    # Create a circular mask
    mask = Image.new('L', (circle_size, circle_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, circle_size, circle_size), fill=255)

    # Apply circular mask to remove corners
    circle_area.putalpha(mask)

    # Save the extracted circle
    output_path = os.path.join(ASSETS_DIR, 'kn-circle.png')
    circle_area.save(output_path, 'PNG')

    print(f'✅ KN circle extracted and saved')
    print(f'   Output: kn-circle.png')
    print(f'   Size: {circle_size}x{circle_size}')

    # Also create a smaller version for watermarks
    small_size = 512
    circle_small = circle_area.resize((small_size, small_size), Image.Resampling.LANCZOS)
    small_output = os.path.join(ASSETS_DIR, 'kn-circle-512.png')
    circle_small.save(small_output, 'PNG')

    print(f'✅ Created smaller version: kn-circle-512.png')

    return output_path, small_output

def main():
    print(f'\n📁 Working directory: {ASSETS_DIR}\n')

    # Download logo
    logo_path = download_logo()

    # Extract KN circle
    full_path, small_path = extract_kn_circle(logo_path)

    print('\n' + '=' * 60)
    print('✅ EXTRACTION COMPLETE!')
    print('=' * 60)
    print('\n📸 Created files:')
    print(f'   • kn-circle.png (full resolution)')
    print(f'   • kn-circle-512.png (512x512 for watermarks)')
    print('\n💡 These can now be used for:')
    print('   • Website branding')
    print('   • Image watermarks')
    print('   • Social media profiles')
    print('   • Favicons\n')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)
