#!/usr/bin/env python3
"""
Create new Kano State logo:
- Remove background from original logo
- Replace with circular KN emblem
- Keep text "Kano State Government Official Portal" in front
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import urllib.request

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '../temp-kano-assets')
LOGO_URL = 'https://old.acresal.gov.ng/wp-content/uploads/2023/05/KANO.png'

print('🎨 CREATING NEW KANO STATE LOGO')
print('=' * 60)

def download_if_needed(url, filename):
    """Download if file doesn't exist"""
    filepath = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(filepath):
        print(f'✅ {filename} already exists')
        return filepath

    print(f'📥 Downloading {filename}...')
    urllib.request.urlretrieve(url, filepath)
    print(f'✅ Downloaded')
    return filepath

def create_new_logo():
    """Create new logo with KN circle and text"""
    print('\n🔨 Creating new logo composition...')

    # Load the original logo
    original_path = os.path.join(ASSETS_DIR, 'kano-logo-original.png')
    original = Image.open(original_path).convert('RGBA')

    width, height = original.size
    print(f'   Original size: {width}x{height}')

    # Create a new transparent canvas
    new_logo = Image.new('RGBA', (width, height), (255, 255, 255, 0))

    # Load the extracted KN circle
    kn_circle_path = os.path.join(ASSETS_DIR, 'kn-circle.png')
    kn_circle = Image.open(kn_circle_path).convert('RGBA')

    # Resize KN circle to fit nicely (about 80% of logo height)
    circle_size = int(height * 0.8)
    kn_circle = kn_circle.resize((circle_size, circle_size), Image.Resampling.LANCZOS)

    # Position KN circle on the left (where it originally was)
    circle_x = int(width * 0.05)
    circle_y = (height - circle_size) // 2
    new_logo.paste(kn_circle, (circle_x, circle_y), kn_circle)

    print(f'✅ KN circle positioned at ({circle_x}, {circle_y})')

    # Now extract and add the text portion from original logo
    # The text is on the right side of the logo
    text_left = int(width * 0.35)  # Start after the circle
    text_area = original.crop((text_left, 0, width, height))

    # Paste text area
    new_logo.paste(text_area, (text_left, 0), text_area)

    print('✅ Text "Kano State Government Official Portal" preserved')

    # Save the new logo
    output_path = os.path.join(ASSETS_DIR, 'kano-logo-new.png')
    new_logo.save(output_path, 'PNG')

    print(f'✅ New logo saved: kano-logo-new.png')
    print(f'   Size: {width}x{height}')

    # Also create a version with white background for non-transparent uses
    white_bg = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    white_bg.paste(new_logo, (0, 0), new_logo)
    white_bg_path = os.path.join(ASSETS_DIR, 'kano-logo-new-white-bg.png')
    white_bg.convert('RGB').save(white_bg_path, 'PNG')

    print(f'✅ White background version: kano-logo-new-white-bg.png')

    return output_path, white_bg_path

def main():
    print(f'\n📁 Working directory: {ASSETS_DIR}\n')
    os.makedirs(ASSETS_DIR, exist_ok=True)

    # Ensure we have the original logo and KN circle
    download_if_needed(LOGO_URL, 'kano-logo-original.png')

    # Check if KN circle exists
    kn_circle_path = os.path.join(ASSETS_DIR, 'kn-circle.png')
    if not os.path.exists(kn_circle_path):
        print('❌ KN circle not found. Please run extract-kn-circle.py first.')
        return

    # Create new logo
    transparent_path, white_bg_path = create_new_logo()

    print('\n' + '=' * 60)
    print('✅ NEW LOGO CREATED!')
    print('=' * 60)
    print('\n📸 Output files:')
    print(f'   • kano-logo-new.png (transparent background)')
    print(f'   • kano-logo-new-white-bg.png (white background)')
    print('\n💡 Features:')
    print('   ✓ Circular KN emblem with transparent background')
    print('   ✓ Text "Kano State Government Official Portal" preserved')
    print('   ✓ Clean, professional appearance')
    print('   ✓ Ready for web and print use\n')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        import sys
        sys.exit(1)