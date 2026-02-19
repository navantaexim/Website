from PIL import Image
import os

def optimize_image(filename, new_filename, max_width=1600, quality=85):
    try:
        if not os.path.exists(filename):
            print(f"File not found: {filename}")
            return
        
        with Image.open(filename) as img:
            # Convert to RGB if necessary (e.g. PNG with alpha to JPG)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too big
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_height = int(height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            img.save(new_filename, 'JPEG', quality=quality)
            print(f"Optimized {filename} -> {new_filename}")
    except Exception as e:
        print(f"Error optimizing {filename}: {e}")

# Optimize scroll images
optimize_image('public/scroll3.png', 'public/scroll3.jpg')
optimize_image('public/scroll4.png', 'public/scroll4.jpg')
